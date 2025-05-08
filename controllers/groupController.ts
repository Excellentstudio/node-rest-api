import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Group from '../models/group';
import User from '../models/user';

export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    
    // Check if group name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ message: 'A group with this name already exists' });
    }

    const group = await Group.create({ name, members: [] });
    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (err) {
    next(new Error('Failed to create group: ' + (err as Error).message));
  }
};

export const joinGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { groupId } = req.body;
    const userId = (req as any).user.userId;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }
    
    group.members.push(userId);
    await group.save();
    
    res.json({ message: 'Joined group successfully', group });
  } catch (err) {
    next(err);
  }
};

export const leaveGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { groupId } = req.body;
    const userId = (req as any).user.userId;
    
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }
    
    group.members = group.members.filter((id: any) => id.toString() !== userId);
    await group.save();
    res.json({ message: 'Left group successfully', group });
  } catch (err) {
    next(err);
  }
};

export const listGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [groups, total] = await Promise.all([
      Group.find()
        .skip(skip)
        .limit(limit)
        .populate('members', 'name email'),
      Group.countDocuments()
    ]);

    res.json({
      groups,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalGroups: total
    });
  } catch (err) {
    next(new Error('Failed to fetch groups: ' + (err as Error).message));
  }
};
