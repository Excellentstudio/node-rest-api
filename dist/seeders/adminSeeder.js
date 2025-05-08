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
exports.seedAdmin = void 0;
const admin_1 = __importDefault(require("../models/admin"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const seedAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const adminCount = yield admin_1.default.countDocuments();
    if (adminCount === 0) {
        const hashedPassword = yield bcryptjs_1.default.hash(process.env.DEFAULT_ADMIN_PASSWORD, 10);
        yield admin_1.default.create({
            name: process.env.DEFAULT_ADMIN_NAME || 'Admin',
            email: process.env.DEFAULT_ADMIN_EMAIL,
            password: hashedPassword
        });
        // Optionally log to console or file
        console.log('Default admin created');
    }
});
exports.seedAdmin = seedAdmin;
