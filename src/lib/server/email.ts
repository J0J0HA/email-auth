import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: 465,
    auth: {
        user: process.env.SMTP_USER || "user",
        pass: process.env.SMTP_PASS || "password",
    }
});


export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || "user@example.com",
        to,
        subject,
        text: body,
    };
    const sentMessage = await transporter.sendMail(mailOptions);
    console.log("[MAIL] Email to %s sent: %s", to, sentMessage.messageId);
    console.log("[MAIL] -> a:%s r:%s p:%s", sentMessage.accepted, sentMessage.rejected, sentMessage.response);
}