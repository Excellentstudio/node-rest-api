"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendGroupMessage = exports.sendDirectMessage = exports.adminLogin = exports.userLogin = exports.verifyEmail = exports.signup = void 0;
const user_1 = __importDefault(require("../models/user"));
const admin_1 = __importDefault(require("../models/admin"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../utils/email");
const express_validator_1 = require("express-validator");
const websocket_1 = require("../websocket");
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, firstName, email, country, password } = req.body;
        const existing = yield user_1.default.findOne({ email });
        if (existing)
            return res.status(400).json({ message: 'Email already in use' });
        const hashed = yield bcryptjs_1.default.hash(password, 10);
        const user = yield user_1.default.create({ name, firstName, email, country, password: hashed, emailVerified: false });
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        yield (0, email_1.sendVerificationEmail)(email, token);
        res.status(201).json({ message: 'Signup successful, check your email to verify.' });
    }
    catch (err) {
        next(err);
    }
});
exports.signup = signup;
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query;
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield user_1.default.findById(decoded.userId);
        if (!user)
            return res.status(400).json({ message: 'Invalid token' });
        user.emailVerified = true;
        yield user.save();
        // Generate new authentication token
        const authToken = jsonwebtoken_1.default.sign({ userId: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
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
    }
    catch (err) {
        next(err);
    }
});
exports.verifyEmail = verifyEmail;
const userLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const user = yield user_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'Invalid credentials' });
        if (!user.emailVerified)
            return res.status(403).json({ message: 'Email not verified' });
        const match = yield bcryptjs_1.default.compare(password, user.password);
        if (!match)
            return res.status(400).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
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
    }
    catch (err) {
        next(err);
    }
});
exports.userLogin = userLogin;
const adminLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const admin = yield admin_1.default.findOne({ email });
        if (!admin)
            return res.status(400).json({ message: 'Invalid credentials' });
        const match = yield bcryptjs_1.default.compare(password, admin.password);
        if (!match)
            return res.status(400).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ adminId: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            },
            expiresIn: 86400 // 24 hours in seconds
        });
    }
    catch (err) {
        next(err);
    }
});
exports.adminLogin = adminLogin;
const sendDirectMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { to, content } = req.body;
        if (!to || !content) {
            return res.status(400).json({ message: 'Recipient userId and content are required' });
        }
        const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!senderId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { users } = (0, websocket_1.getWebSocketMaps)();
        if (users[to]) {
            users[to].send(JSON.stringify({ from: senderId, content, type: 'direct_message' }));
            return res.json({ message: 'Message sent via WebSocket' });
        }
        else {
            return res.status(404).json({ message: 'Recipient not connected' });
        }
    }
    catch (err) {
        next(err);
    }
});
exports.sendDirectMessage = sendDirectMessage;
const sendGroupMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { groupId, content } = req.body;
        if (!groupId || !content) {
            return res.status(400).json({ message: 'GroupId and content are required' });
        }
        const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!senderId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { users, groups } = (0, websocket_1.getWebSocketMaps)();
        if (groups[groupId]) {
            groups[groupId].forEach(uid => {
                if (users[uid] && uid !== senderId) {
                    users[uid].send(JSON.stringify({ from: senderId, groupId, content, type: 'group_message' }));
                }
            });
            return res.json({ message: 'Group message sent via WebSocket' });
        }
        else {
            return res.status(404).json({ message: 'Group not found or no members connected' });
        }
    }
    catch (err) {
        next(err);
    }
});
exports.sendGroupMessage = sendGroupMessage;
