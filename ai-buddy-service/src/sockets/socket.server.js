import { Server } from "socket.io";
import _config from "../config/config.js";
import logger from "../loggers/winston.logger.js";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import redis from "../db/redis.js";
import agent from "../agent/agent.js";

async function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: _config.CORS_ORIGIN,
            credentials: true,
        },
    });

    // Authenticate & Authorization (RBAC) - Middleware
    io.use(async (socket, next) => {
        const headers = socket.handshake?.headers;
        const cookies = headers?.cookie ? cookie.parse(headers?.cookie) : {};
        const accessToken = cookies?.accessToken || headers?.authorization?.split(" ")?.[1];

        if (!accessToken) {
            return next(new Error("Access token not found, please login again"));
        }

        // Check if token is blacklisted (logged out)
        const isBlacklistedToken = await redis.get(`blacklist:${accessToken}`);

        if (isBlacklistedToken) {
            return next(new Error("Token has been invalidated, please login again"));
        }

        try {
            const decoded = jwt.verify(accessToken, _config.JWT.ACCESS_TOKEN_SECRET);

            // Check if user has required role
            if (decoded.role !== "user") {
                return next(new Error("Unauthorized access"));
            }

            socket.user = decoded;
            socket.accessToken = accessToken;
            next();
        } catch {
            return next(new Error("Invalid access token"));
        }
    });

    io.on("connection", (socket) => {
        logger.info(`🟢 A user connected: ${socket.user?._id}`);

        socket.on("client-message", async (prompt) => {
            const agentResponse = await agent.invoke(
                {
                    messages: [
                        {
                            role: "user",
                            content: prompt?.trim(),
                        },
                    ],
                },
                {
                    metadata: {
                        accessToken: socket.accessToken,
                    },
                }
            );

            const lastMessage = agentResponse.messages[agentResponse.messages.length - 1];

            socket.emit("agent-response", lastMessage.content?.trim());
        });
    });
}

export default initSocketServer;
