import nodemailer from "nodemailer";
import _config from "../config/config.js";
import logger from "../loggers/winston.logger.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: _config.OAUTH.EMAIL_USER,
        clientId: _config.OAUTH.CLIENT_ID,
        clientSecret: _config.OAUTH.CLIENT_SECRET,
        refreshToken: _config.OAUTH.REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error) => {
    if (error) {
        logger.error("Error connecting to email server:", { meta: error });

        setTimeout(() => process.exit(1), 1000);
    } else {
        logger.info("Email server is ready to send messages");
    }
});

// Function to send email
export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"MarketMind" <${_config.OAUTH.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        logger.info(`Message sent: ${info.messageId}`);
    } catch (error) {
        delete error.stack;
        logger.error("Error sending email:", { meta: error });
    }
};
