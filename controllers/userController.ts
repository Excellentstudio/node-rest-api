import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import Admin from '../models/admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/email';
import { validationResult } from 'express-validator';
import { getWebSocketMaps } from '../websocket';
import { authenticateUser } from '../middleware/auth';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, firstName, email, country, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, firstName, email, country, password: hashed, emailVerified: false });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    await sendVerificationEmail(email, token);
    res.status(201).json({ message: 'Signup successful, check your email to verify.' });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;
    const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    user.emailVerified = true;
    await user.save();

    // Generate new authentication token
    const authToken = jwt.sign({ userId: user._id, role: 'user' }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    
    res.json({ 
      message: 'Email verified successfully',
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        email: user.email,
        country: user.country
      },
      expiresIn: 86400 // 24 hours in seconds
    });
  } catch (err) {
    next(err);
  }
};

export const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.emailVerified) return res.status(403).json({ message: 'Email not verified' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, role: 'user' }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        email: user.email,
        country: user.country
      },
      expiresIn: 86400 // 24 hours in seconds
    });
  } catch (err) {
    next(err);
  }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ adminId: admin._id, role: 'admin' }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    res.json({ 
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      },
      expiresIn: 86400 // 24 hours in seconds
    });
  } catch (err) {
    next(err);
  }
};

export const sendDirectMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { to, content } = req.body;
    if (!to || !content) {
      return res.status(400).json({ message: 'Recipient userId and content are required' });
    }
    const senderId = (req as any).user?.userId;
    if (!senderId) return res.status(401).json({ message: 'Unauthorized' });
    const { users } = getWebSocketMaps();
    if (users[to]) {
      users[to].send(JSON.stringify({ from: senderId, content, type: 'direct_message' }));
      return res.json({ message: 'Message sent via WebSocket' });
    } else {
      return res.status(404).json({ message: 'Recipient not connected' });
    }
  } catch (err) {
    next(err);
  }
};

export const sendGroupMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId, content } = req.body;
    if (!groupId || !content) {
      return res.status(400).json({ message: 'GroupId and content are required' });
    }
    const senderId = (req as any).user?.userId;
    if (!senderId) return res.status(401).json({ message: 'Unauthorized' });
    const { users, groups } = getWebSocketMaps();
    if (groups[groupId]) {
      groups[groupId].forEach(uid => {
        if (users[uid] && uid !== senderId) {
          users[uid].send(JSON.stringify({ from: senderId, groupId, content, type: 'group_message' }));
        }
      });
      return res.json({ message: 'Group message sent via WebSocket' });
    } else {
      return res.status(404).json({ message: 'Group not found or no members connected' });
    }
  } catch (err) {
    next(err);
  }
};
