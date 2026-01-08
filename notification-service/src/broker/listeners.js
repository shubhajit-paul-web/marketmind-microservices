import broker from "./broker.js";
import { sendEmail } from "../services/email.service.js";

function setListeners() {
    broker.subscribeToQueue("AUTH_NOTIFICATION.USER_CREATED", async (data) => {
        const emailTemplate = `
        <p>
            Hi <b>${data.fullName?.firstName}</b>, <br><br>

            Welcome aboard! 👋 <br>
            We’re happy to let you know that your registration was completed successfully.
            You can now log in and start using your account anytime. <br><br>

            <b><u>Account details:</u></b><br>
            Email: ${data.email} <br>
            Username: ${data.username} <br><br>

            If you have any questions or need help, feel free to reach out—we’re always here for you.<br><br>

            <i>Thanks for joining us, and we’re excited to have you with us!</i>
            <br><br>
            Best regards,<br>
            <b>MarketMind</b> Team
        </p>`;

        sendEmail({
            to: data.email,
            subject: "Welcome! Your Registration Is Complete 🎉",
            html: emailTemplate,
        });
    });
}

export default setListeners;
