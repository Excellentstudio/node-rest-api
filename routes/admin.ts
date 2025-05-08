import express, { Request, Response, NextFunction } from 'express';
import { addAdmin, listAdmins } from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';
import { body } from 'express-validator';
import { adminLogin } from '../controllers/userController';

const router = express.Router();

/**
 * @swagger
 * /api/admins/add:
 *   post:
 *     summary: Add a new admin (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/add', authenticateAdmin as any, [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], (req: Request, res: Response, next: NextFunction) => {
  addAdmin(req, res, next).catch(next);
});

/**
 * @swagger
 * /api/admins/login:
 *   post:
 *     summary: "Admin login - email: \"admin@example.com\", password: admin1234"
 *     tags: [Admin]
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
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 expiresIn:
 *                   type: number
 *                   description: Token expiration time in seconds
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], (req: Request, res: Response, next: NextFunction) => {
  adminLogin(req, res, next).catch(next);
});

/**
 * @swagger
 * /api/admins:
 *   get:
 *     summary: List all admins (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admins
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateAdmin as any, (req: Request, res: Response, next: NextFunction) => {
  listAdmins(req, res, next).catch(next);
});

export default router;
