import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Mireakart'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: html || `<p>${text}</p>`,
      text: text || '',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} — Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email sending failed: ${error.message}`);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

export default sendEmail;
