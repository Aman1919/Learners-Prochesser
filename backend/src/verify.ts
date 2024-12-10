import { BACKEND_URL, FRONTEND_URL } from "./constants";
import { generateToken } from "./utils";
import nodemailer from "nodemailer";
import { NODEMAILER_MAIL, NODEMAILER_PASS } from "./constants";

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: NODEMAILER_MAIL,
    pass: NODEMAILER_PASS,
  },
});
// Function to send email verification
export async function EmailVerification(email: string) {
  try {
    const token = generateToken(
      {
        data: email,
      },
      "10m",
    );

    const mailConfigurations = {
      from: `${NODEMAILER_MAIL}`,
      to: email,
      subject: "Email Verification for Your ProChesser Account",
      html: `
      <p>Thank you for visiting ProChesser! We noticed that you recently entered your email address on our website. To ensure the security of your account and enhance your experience with us, please verify your email by clicking the link below:</p>
      <a href="${BACKEND_URL}/api/auth/verify/${token}">Verify Your Email</a>
      <p>If you have any questions or need assistance, feel free to reach out to our support team at support@prochessser.com<p>
      <p>Thank you for choosing ProChesser!</p>
      <p>Sincerely,</p>
    <p>The ProChesser Team</p>
    <a href="https://www.prochesser.com/">https://www.prochesser.com/</a>    
      `,
    };

    await transporter.sendMail(mailConfigurations);
    console.log("Email Sent Successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Function to send the forgot password email with a reset link
export const SendForgotPassword = async (email: string, token: string) => {
  try {
    const resetLink = `${FRONTEND_URL}/reset-password/${token}`;
    console.log("Sending: ", token);

    const mailOptions = {
      from: `${NODEMAILER_MAIL}`,
      to: email,
      subject: "Account Password Reset",
      html: `<p>To reset the password to your ProChesser account, click the link below:</p>
             <a href="${resetLink}">Reset Password</a>
             <p>This link will expire in 10 minutes.</p>
             <p>If you have any questions or need assistance, feel free to reach out to our support team at support@prochessser.com<p>
      <p>Thank you for choosing ProChesser!</p>
      <p>Sincerely,</p>
    <p>The ProChesser Team</p>
    <a href="https://www.prochesser.com/">https://www.prochesser.com/</a>    
             `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

