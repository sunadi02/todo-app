
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

exports.sendResetEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">TaskFlow Password Reset</h2>
        <p>Your password reset code is:</p>
        <div style="background: #f3f4f6; padding: 10px; border-radius: 5px; font-size: 24px; letter-spacing: 2px; display: inline-block; margin: 10px 0;">
          ${code}
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};