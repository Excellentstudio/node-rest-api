"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const groupController_1 = require("../controllers/groupController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
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
const router = express_1.default.Router();
router.post('/create', validation_1.validateGroupCreation, (req, res, next) => {
    (0, groupController_1.createGroup)(req, res, next).catch(next);
});
router.post('/join', auth_1.authenticateUser, validation_1.validateGroupJoinLeave, (req, res, next) => {
    (0, groupController_1.joinGroup)(req, res, next).catch(next);
});
router.post('/leave', auth_1.authenticateUser, validation_1.validateGroupJoinLeave, (req, res, next) => {
    (0, groupController_1.leaveGroup)(req, res, next).catch(next);
});
router.get('/', (req, res, next) => {
    (0, groupController_1.listGroups)(req, res, next).catch(next);
});
exports.default = router;
