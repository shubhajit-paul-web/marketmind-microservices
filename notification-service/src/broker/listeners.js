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

    broker.subscribeToQueue("AUTH_NOTIFICATION.PASSWORD_CHANGED", async (data) => {
        const emailTemplate = `
            <p>Hi ${data.fullName?.firstName},<br><br>

            This is a quick note to let you know that your account password was successfully changed.<br><br>

            If you made this change, you’re all set 👍<br>
            If you didn’t, please reset your password right away or contact our support team.
            <br><br>
            Stay safe,<br>
            MarketMind</p>
        `;

        sendEmail({
            to: data.email,
            subject: "Your password has been changed",
            html: emailTemplate,
        });
    });

    broker.subscribeToQueue("ORDER_NOTIFICATION.ORDER_CREATED", async (data) => {
        const fullName = data?.customerDetails?.fullName;
        const { street, landmark, city, state, country, zip } = data?.shippingAddress ?? {};

        const emailTemplate = `<p>
            Hi ${fullName?.firstName}, <br><br>

            Thanks for your order! We’re happy to let you know that your order has been placed successfully. <br><br>

            <b>Order Details:</b> <br>
            <ul>
                <li><b>Order ID:</b> #${data?.orderId}</li>
                <li><b>Total Price:</b> ${data?.totalPrice?.currency} ${data?.totalPrice?.amount?.toFixed(2)}</li>
            </ul>

            <p>
                <b>Delivery Address:</b> <br>
                <i>
                    ${fullName?.firstName + " " + fullName?.lastName},
                    ${street}, ${landmark ? landmark + "," : ""}
                    ${city}, ${state} - ${zip},
                    ${country}
                </i>
            </p><br>

            We’re preparing your order and will notify you once it’s shipped.<br><br>

            If you have any questions, feel free to reach out—we’re always here to help 😊<br><br>

            Thanks for choosing us,<br>
            MarketMind
        </p>`;

        sendEmail({
            to: data?.customerDetails?.email,
            subject: "Order confirmed! 🎉",
            html: emailTemplate,
        });
    });

    broker.subscribeToQueue("ORDER_NOTIFICATION.ORDER_CANCELLED", async (data) => {
        const emailTemplate = `
            Hi ${data.fullName?.firstName}, <br><br>

            We wanted to let you know that your order (<b>Order ID: #${data.orderId}</b>) has been successfully cancelled. <br><br>

            Thanks for your understanding, <br>
            MarketMind
        `;

        sendEmail({
            to: data.email,
            subject: "Your order has been cancelled",
            html: emailTemplate,
        });
    });
}

export default setListeners;
