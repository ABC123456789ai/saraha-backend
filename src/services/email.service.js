import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Saraha App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

const testEmail = async () => {
  await sendEmail(
    process.env.EMAIL_USER,
    "Saraha Test Email",
    "<h1>Hello from Saraha 🌸</h1><p>Email service is working!</p>"
  );

  console.log("Test Email Sent Successfully ✅");
};

export {
  sendEmail,
  testEmail,
};