import Admin from '../models/admin';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const addAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only an admin can add another admin (should be protected by middleware)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashed });
    res.status(201).json({ message: 'Admin created', admin: { _id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    next(err);
  }
};

export const listAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admins = await Admin.find({}, '-password');
    res.json(admins);
  } catch (err) {
    next(err);
  }
};
