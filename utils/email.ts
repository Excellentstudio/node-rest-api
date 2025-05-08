import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, token: string) => {
  // For demo: just log the link instead of sending real email
  const link = `${process.env.BASE_URL || 'http://localhost:3000'}/api/users/verify-email?token=${token}`;
  console.log(`Verify email for ${email}: ${link}`);
  // In production, use nodemailer to send the email
};
