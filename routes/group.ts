import express from 'express';
import { createGroup, joinGroup, leaveGroup, listGroups } from '../controllers/groupController';
import { validateGroupCreation, validateGroupJoinLeave } from '../middleware/validation';
import { Request, Response, NextFunction } from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth';

/**
 * @swagger
 * /api/groups/create:
 *   post:
 *     summary: Create a group
 *     tags: [Group]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Group created
 *       400:
 *         description: Validation error
 *
 * /api/groups/join:
 *   post:
 *     summary: Join a group
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: ID of the group to join
 *     responses:
 *       200:
 *         description: Joined group successfully
 *       400:
 *         description: Validation error or already a member
 *       401:
 *         description: Unauthorized - not logged in
 *       404:
 *         description: Group not found
 *
 * /api/groups/leave:
 *   post:
 *     summary: Leave a group
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: ID of the group to leave
 *     responses:
 *       200:
 *         description: Left group successfully
 *       400:
 *         description: Validation error or not a member
 *       401:
 *         description: Unauthorized - not logged in
 *       404:
 *         description: Group not found
 *
 * /api/groups:
 *   get:
 *     summary: List all groups with pagination
 *     tags: [Group]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalGroups:
 *                   type: integer
 */

const router = express.Router();

router.post('/create', validateGroupCreation, (req: Request, res: Response, next: NextFunction) => {
  createGroup(req, res, next).catch(next);
});

router.post('/join', authenticateUser as any, validateGroupJoinLeave, (req: Request, res: Response, next: NextFunction) => {
  joinGroup(req, res, next).catch(next);
});

router.post('/leave', authenticateUser as any, validateGroupJoinLeave, (req: Request, res: Response, next: NextFunction) => {
  leaveGroup(req, res, next).catch(next);
});

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  listGroups(req, res, next).catch(next);
});

export default router;
