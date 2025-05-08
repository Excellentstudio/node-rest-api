import express from 'express';
import { signup, verifyEmail, userLogin, adminLogin, sendDirectMessage, sendGroupMessage } from '../controllers/userController';
import { validateUserSignup } from '../middleware/validation';
import { authenticateUser } from '../middleware/auth';
import { body } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: User signup
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - firstName
 *               - email
 *               - country
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               firstName:
 *                 type: string
 *               email:
 *                 type: string
 *               country:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Signup successful
 *       400:
 *         description: Validation error
 *
 * /api/users/verify-email:
 *   get:
 *     summary: Verify user email
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     country:
 *                       type: string
 *                 expiresIn:
 *                   type: number
 *                   description: Token expiration time in seconds
 *       400:
 *         description: Invalid token
 *
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     country:
 *                       type: string
 *                 expiresIn:
 *                   type: number
 *                   description: Token expiration time in seconds
 *       400:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 *
 * /api/users/websocket-docs:
 *   get:
 *     summary: Get WebSocket messaging protocol documentation
 *     tags: [User]
 *     responses:
 *       200:
 *         description: WebSocket message protocol
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 direct_message:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: direct_message
 *                     to:
 *                       type: string
 *                       description: Recipient userId
 *                     content:
 *                       type: string
 *                 group_message:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: group_message
 *                     groupId:
 *                       type: string
 *                     content:
 *                       type: string
 *                 join_group:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: join_group
 *                     groupId:
 *                       type: string
 *                 leave_group:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: leave_group
 *                     groupId:
 *                       type: string
 *
 * /api/users/direct-message:
 *   post:
 *     summary: Send a direct message to another user via WebSocket
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - content
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient userId
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recipient not connected
 *
 * /api/users/group-message:
 *   post:
 *     summary: Send a message to a group via WebSocket
 *     tags: [User]
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
 *               - content
 *             properties:
 *               groupId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group message sent
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found or no members connected
 */

router.post('/signup', validateUserSignup, (req: Request, res: Response, next: NextFunction) => {
  signup(req, res, next).catch(next);
});

router.get('/verify-email', (req: Request, res: Response, next: NextFunction) => {
  verifyEmail(req, res, next).catch(next);
});

router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], (req: Request, res: Response, next: NextFunction) => {
  userLogin(req, res, next).catch(next);
});

router.get('/websocket-docs', (req: Request, res: Response) => {
  res.json({
    direct_message: {
      type: 'direct_message',
      to: 'recipientUserId',
      content: 'Message text'
    },
    group_message: {
      type: 'group_message',
      groupId: 'groupId',
      content: 'Message text'
    },
    join_group: {
      type: 'join_group',
      groupId: 'groupId'
    },
    leave_group: {
      type: 'leave_group',
      groupId: 'groupId'
    }
  });
});

router.post('/direct-message', authenticateUser as any, sendDirectMessage as any);
router.post('/group-message', authenticateUser as any, sendGroupMessage as any);

export default router;
