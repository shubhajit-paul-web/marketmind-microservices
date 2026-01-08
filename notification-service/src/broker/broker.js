import rabbit from "amqplib";
import _config from "../config/config.js";
import logger from "../loggers/winston.logger.js";

let channel, connection;

// Establish a single RabbitMQ connection/channel for reuse across the service
async function connectToRabbit() {
    try {
        // Reuse existing connection to avoid creating multiple sockets
        if (connection) return connection;

        connection = await rabbit.connect(_config.RABBIT_URL);
        logger.info("RabbitMQ: Connected successfully");

        channel = await connection.createChannel();
        logger.info("RabbitMQ: Channel created successfully");
    } catch (error) {
        logger.error("RabbitMQ Error: connection faild", { meta: error });

        setTimeout(() => process.exit(1), 1000);
    }
}

/**
 * Publishes a message to a RabbitMQ queue.
 *
 * @param {string} queueName - The name of the queue to publish the message to
 * @param {Object} [data={}] - The message data to publish. Will be serialized to JSON
 * @returns {Promise<void>}
 */
async function publishToQueue(queueName, data = {}) {
    if (!connection || !channel) await connectToRabbit();

    await channel.assertQueue(queueName, {
        durable: true,
    });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
}

/**
 * Subscribes to a RabbitMQ queue and processes incoming messages.
 *
 * @param {string} queueName - The name of the queue to subscribe to
 * @param {Function} callback - Async function to handle each message. Receives the parsed message data
 * @returns {Promise<void>}
 */
async function subscribeToQueue(queueName, callback) {
    if (!connection || !channel) await connectToRabbit();

    await channel.assertQueue(queueName, {
        durable: true,
    });

    channel.consume(queueName, async (message) => {
        if (message) {
            try {
                const data = JSON.parse(message?.content?.toString());
                await callback(data);
                channel.ack(message);
            } catch (error) {
                logger.error("RabbitMQ: Failed to process message from queue", {
                    meta: error,
                });
            }
        }
    });
}

export default { connectToRabbit, channel, connection, publishToQueue, subscribeToQueue };
