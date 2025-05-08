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
exports.listAdmins = exports.addAdmin = void 0;
const admin_1 = __importDefault(require("../models/admin"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const addAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only an admin can add another admin (should be protected by middleware)
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;
        const existing = yield admin_1.default.findOne({ email });
        if (existing)
            return res.status(400).json({ message: 'Email already in use' });
        const hashed = yield bcryptjs_1.default.hash(password, 10);
        const admin = yield admin_1.default.create({ name, email, password: hashed });
        res.status(201).json({ message: 'Admin created', admin: { _id: admin._id, name: admin.name, email: admin.email } });
    }
    catch (err) {
        next(err);
    }
});
exports.addAdmin = addAdmin;
const listAdmins = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield admin_1.default.find({}, '-password');
        res.json(admins);
    }
    catch (err) {
        next(err);
    }
});
exports.listAdmins = listAdmins;
