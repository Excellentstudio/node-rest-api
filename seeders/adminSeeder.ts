import Admin from '../models/admin';
import bcrypt from 'bcryptjs';

export const seedAdmin = async () => {
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD!, 10);
    await Admin.create({
      name: process.env.DEFAULT_ADMIN_NAME || 'Admin',
      email: process.env.DEFAULT_ADMIN_EMAIL!,
      password: hashedPassword
    });
    // Optionally log to console or file
    console.log('Default admin created');
  }
};
