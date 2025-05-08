"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGroupJoinLeave = exports.validateGroupCreation = exports.validateAdminLogin = exports.validateUserLogin = exports.validateUserSignup = void 0;
const express_validator_1 = require("express-validator");
exports.validateUserSignup = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('firstName').notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('country').notEmpty().withMessage('Country is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
exports.validateUserLogin = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
exports.validateAdminLogin = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
exports.validateGroupCreation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Group name is required'),
];
exports.validateGroupJoinLeave = [
    (0, express_validator_1.body)('groupId').notEmpty().withMessage('Group ID is required')
];
