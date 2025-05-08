import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const link = `${process.env.BASE_URL || 'http://localhost:3000'}/api/users/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Your App Name" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Welcome to Your App Name!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <p style="text-align: center;">
          <a href="${link}" style="background: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        </p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${link}">${link}</a></p>
        <hr>
        <small>If you did not request this, please ignore this email.</small>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
