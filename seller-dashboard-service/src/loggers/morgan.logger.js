import morgan from "morgan";
import logger from "./winston.logger.js";

const format = ":method :url :status :res[content-length] - :response-time ms";

export default morgan(format, {
    stream: {
        write: (msg) => logger.http(msg.trim()),
    },
});
