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
exports.listGroups = exports.leaveGroup = exports.joinGroup = exports.createGroup = void 0;
const express_validator_1 = require("express-validator");
const group_1 = __importDefault(require("../models/group"));
const createGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name } = req.body;
        // Check if group name already exists
        const existingGroup = yield group_1.default.findOne({ name });
        if (existingGroup) {
            return res.status(400).json({ message: 'A group with this name already exists' });
        }
        const group = yield group_1.default.create({ name, members: [] });
        res.status(201).json({
            message: 'Group created successfully',
            group
        });
    }
    catch (err) {
        next(new Error('Failed to create group: ' + err.message));
    }
});
exports.createGroup = createGroup;
const joinGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { groupId } = req.body;
        const userId = req.user.userId;
        const group = yield group_1.default.findById(groupId);
        if (!group)
            return res.status(404).json({ message: 'Group not found' });
        if (group.members.includes(userId)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }
        group.members.push(userId);
        yield group.save();
        res.json({ message: 'Joined group successfully', group });
    }
    catch (err) {
        next(err);
    }
});
exports.joinGroup = joinGroup;
const leaveGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { groupId } = req.body;
        const userId = req.user.userId;
        const group = yield group_1.default.findById(groupId);
        if (!group)
            return res.status(404).json({ message: 'Group not found' });
        if (!group.members.includes(userId)) {
            return res.status(400).json({ message: 'You are not a member of this group' });
        }
        group.members = group.members.filter((id) => id.toString() !== userId);
        yield group.save();
        res.json({ message: 'Left group successfully', group });
    }
    catch (err) {
        next(err);
    }
});
exports.leaveGroup = leaveGroup;
const listGroups = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [groups, total] = yield Promise.all([
            group_1.default.find()
                .skip(skip)
                .limit(limit)
                .populate('members', 'name email'),
            group_1.default.countDocuments()
        ]);
        res.json({
            groups,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalGroups: total
        });
    }
    catch (err) {
        next(new Error('Failed to fetch groups: ' + err.message));
    }
});
exports.listGroups = listGroups;
