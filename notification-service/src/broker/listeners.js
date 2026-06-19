import broker from "./broker.js";
import { sendEmail } from "../services/email.service.js";
import formatISOString from "../utils/formatISOString.js";
import formatTimestamps from "../utils/formatTimestamps.js";

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

    broker.subscribeToQueue("AUTH_NOTIFICATION.OTP_GENERATED", async (data) => {
        const { email, OTP } = data;

        const emailTemplate = `
        <div style="margin:0; padding:0; background-color:#f6f7f9; font-family:Arial, Helvetica, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0; background-color:#f6f7f9;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                  <tr>
                    <td style="padding:24px 28px; border-bottom:1px solid #eceff3;">
                      <h2 style="margin:0; font-size:18px; color:#111111; font-weight:600;">Password Change Verification</h2>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:28px; color:#333333; font-size:14px; line-height:1.7;">
                      <p style="margin:0 0 16px;">Hello,</p>
                      <p style="margin:0 0 16px;">We received a request to change your account password. Please use the verification code below to confirm this action.</p>

                      <div style="margin:18px 0 22px; padding:14px 16px; background-color:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; font-size:18px; letter-spacing:4px; text-align:center; color:#111111;">
                        <strong>${OTP}</strong>
                      </div>

                      <p style="margin:0 0 16px;">This code is valid for a short time and can be used only once.</p>
                      <p style="margin:0 0 16px;">If you did not request this change, you can safely ignore this email. Your password will remain unchanged.</p>

                      <p style="margin:0;">Regards,<br>MarketMind Security Team</p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:14px 28px; background-color:#f9fafb; color:#6b7280; font-size:12px; text-align:center;">
                      If you need help, contact us at <a href="mailto:support.marketmind@gmail.com" style="color:#2f80ed; text-decoration:none;">support.marketmind@gmail.com</a>.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
        `;

        sendEmail({
            to: email,
            subject: "Your password change verification code",
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

    broker.subscribeToQueue("ORDER_NOTIFICATION.ORDER_DELIVERED", async (data) => {
        const customerDetails = data?.customerDetails;
        const dateAndTime = formatTimestamps(data?.timestamp);

        const emailTemplate = `
        <div style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:30px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; padding:30px; color:#333333;">
          
          <!-- Greeting -->
          <tr>
            <td style="font-size:16px; line-height:1.6;">
              Dear <strong>${customerDetails?.fullName?.firstName}</strong>,
              <br><br>

              We are pleased to inform you that your order
              <strong style="color:#2f80ed;">#${data?.orderId}</strong>
              has been successfully delivered.
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:20px 0;">
              <hr style="border:none; border-top:1px solid #e6e6e6;">
            </td>
          </tr>

          <!-- Delivery Details -->
          <tr>
            <td>
              <h3 style="margin:0 0 10px; font-size:18px; color:#111;">
                Delivery Details
              </h3>

              <table cellpadding="6" cellspacing="0" style="font-size:15px;">
                <tr>
                  <td style="color:#666;">Order ID:</td>
                  <td><strong>#${data?.orderId}</strong></td>
                </tr>
                <tr>
                  <td style="color:#666;">Delivered On:</td>
                  <td><strong>${dateAndTime}</strong></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-top:20px; font-size:15px; line-height:1.6; color:#444;">
              We hope the order meets your expectations. If you have any questions,
              concerns, or require further assistance, please do not hesitate to
              contact our support team.
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top:30px; font-size:14px; color:#555;">
              Sincerely,<br><br>

              <strong style="font-size:16px; color:#111;">MarketMind</strong><br>
              Customer Support Team<br><br>

              <a href="mailto:support.marketmind@gmail.com" style="color:#2f80ed; text-decoration:none;">
                support.marketmind@gmail.com
              </a>
              &nbsp;|&nbsp;
              <a href="tel:+919874561230" style="color:#2f80ed; text-decoration:none;">
                +91 98745 61230
              </a>
            </td>
          </tr>
        </table>
        <!-- End Main Container -->
      </td>
    </tr>
  </table>
</div>
        `;

        sendEmail({
            to: customerDetails?.email,
            subject: `Order Delivered Successfully – Order #${data?.orderId}`,
            html: emailTemplate,
        });
    });

    broker.subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_SUCCESSFUL", async (data) => {
        const user = data?.user;

        const emailTemplate = `
  <div style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px;">
    <tr>
      <td align="center">
        <!-- Email Container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#1a73e8; padding:20px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:22px;">
                Payment Successful
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333; font-size:14px; line-height:1.6;">
              <p style="margin-top:0;">
                Dear ${user?.fullName?.firstName ?? "Customer"},
              </p>

              <p>
                We’re happy to let you know that your payment has been
                <strong>successfully completed</strong>.
              </p>

              <!-- Payment Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; margin:20px 0;">
                <tr>
                  <td style="padding:15px;">
                    <p style="margin:6px 0;"><strong>Order ID:</strong> #${data?.orderId}</p>
                    <p style="margin:6px 0;"><strong>Amount Paid:</strong> ${data?.paymentInfo?.price?.amount} ${data?.paymentInfo?.price?.currency}</p>
                    <p style="margin:6px 0;"><strong>Razorpay Order ID:</strong> ${data?.paymentInfo?.razorpayOrderId}</p>
                    <p style="margin:6px 0;"><strong>Payment ID:</strong> ${data?.paymentInfo?.paymentId}</p>
                    <p style="margin:6px 0;"><strong>Date & Time:</strong> ${formatISOString(data?.timestamp)}</p>
                  </td>
                </tr>
              </table>

              <p>Your order is now being processed. No further action is required from your side.</p>

              <p>
                If you have any questions or need assistance, please contact us at
                <a href="mailto:support.marketmind@gmail.com" style="color:#1a73e8; text-decoration:none;">
                  support.marketmind@gmail.com
                </a>.
              </p>
              <p style="margin-bottom:0;">Thank you for choosing us.</p>
              <p style="margin-top:10px;">
                Warm regards,<br />
                <strong>MarketMind</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f1f3f4; padding:15px; text-align:center; font-size:12px; color:#666666;">
              © 2026 MarketMind. All rights reserved.
            </td>
          </tr>
        </table>
        <!-- End Email Container -->
      </td>
    </tr>
  </table>
</div>
        `;

        sendEmail({
            to: user?.email,
            subject: `Payment Successful – Order #${data?.orderId}`,
            html: emailTemplate,
        });
    });

    broker.subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_FAILD", async (data) => {
        const user = data.user;

        const emailTemplate = `
            Hi ${user?.fullName?.firstName}, <br><br>

            Your recent payment attempt has failed. <br><br>

            <b>Details:</b>
            <ul>
              <li>Payment ID: ${data?.paymentInfo?.paymentId}</li>
              <li>Date & Time: ${formatTimestamps(data?.timestamp)}</li>
            </ul> <br>
            No payment was completed. Please retry the payment to continue your service.
            <br><br>
            Regards,<br>
            MarketMind
        `;

        sendEmail({
            to: user?.email,
            subject: "Payment Failed",
            html: emailTemplate,
        });
    });
}

export default setListeners;
