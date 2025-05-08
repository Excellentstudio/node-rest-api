"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateUser = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({
            message: 'No token provided',
            details: 'Please include the token in the Authorization header'
        });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                message: 'Token expired',
                details: 'Please log in again to obtain a new token'
            });
        }
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                message: 'Invalid token',
                details: 'The token provided is malformed or invalid'
            });
        }
        res.status(401).json({
            message: 'Authentication failed',
            details: 'An error occurred while verifying your token'
        });
    }
};
exports.authenticateUser = authenticateUser;
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({
            message: 'No token provided',
            details: 'Please include the token in the Authorization header'
        });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.role === 'admin') {
            req.admin = decoded;
            next();
        }
        else {
            res.status(403).json({
                message: 'Admin access required',
                details: 'This endpoint requires admin privileges'
            });
        }
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                message: 'Token expired',
                details: 'Please log in again to obtain a new token'
            });
        }
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                message: 'Invalid token',
                details: 'The token provided is malformed or invalid'
            });
        }
        res.status(401).json({
            message: 'Authentication failed',
            details: 'An error occurred while verifying your token'
        });
    }
};
exports.authenticateAdmin = authenticateAdmin;
