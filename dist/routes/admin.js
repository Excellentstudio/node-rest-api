"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
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
router.post('/add', auth_1.authenticateAdmin, [
    (0, express_validator_1.body)('name').notEmpty(),
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 })
], (req, res, next) => {
    (0, adminController_1.addAdmin)(req, res, next).catch(next);
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
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 })
], (req, res, next) => {
    (0, userController_1.adminLogin)(req, res, next).catch(next);
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
router.get('/', auth_1.authenticateAdmin, (req, res, next) => {
    (0, adminController_1.listAdmins)(req, res, next).catch(next);
});
exports.default = router;
