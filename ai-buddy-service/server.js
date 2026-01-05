import http from "http";
import app from "./src/app.js";
import _config from "./src/config/config.js";
import logger from "./src/loggers/winston.logger.js";
import initSocketServer from "./src/sockets/socket.server.js";

const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(_config.PORT, () => {
    logger.info(`Server is running on port ${_config.PORT}`);
});
