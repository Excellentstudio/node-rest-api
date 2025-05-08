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
exports.getWebSocketMaps = getWebSocketMaps;
exports.setupWebSocket = setupWebSocket;
const WebSocket = require('ws');
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let users = {};
let groups = {};
function getWebSocketMaps() {
    return { users, groups };
}
function setupWebSocket(server, logger) {
    const wss = new WebSocket.Server({ server });
    wss.on('connection', (ws, req) => {
        let currentUserId = null;
        logger.info('WebSocket connection established');
        ws.on('message', (data) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const msg = JSON.parse(data);
                switch (msg.type) {
                    case 'init':
                        try {
                            const decoded = jsonwebtoken_1.default.verify(msg.token, process.env.JWT_SECRET);
                            currentUserId = decoded.userId;
                            if (currentUserId) {
                                users[currentUserId] = ws;
                                ws.send(JSON.stringify({ type: 'init_success', userId: currentUserId }));
                            }
                            else {
                                ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
                                ws.close();
                            }
                        }
                        catch (e) {
                            ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
                            ws.close();
                        }
                        break;
                    case 'direct_message':
                        if (!currentUserId)
                            return;
                        if (users[msg.to]) {
                            users[msg.to].send(JSON.stringify({ from: currentUserId, content: msg.content, type: 'direct_message' }));
                        }
                        break;
                    case 'join_group':
                        if (!currentUserId)
                            return;
                        if (!groups[msg.groupId])
                            groups[msg.groupId] = new Set();
                        groups[msg.groupId].add(currentUserId);
                        ws.send(JSON.stringify({ type: 'joined_group', groupId: msg.groupId }));
                        break;
                    case 'leave_group':
                        if (!currentUserId)
                            return;
                        if (groups[msg.groupId])
                            groups[msg.groupId].delete(currentUserId);
                        ws.send(JSON.stringify({ type: 'left_group', groupId: msg.groupId }));
                        break;
                    case 'group_message':
                        if (!currentUserId)
                            return;
                        // Verify sender is a member of the group
                        if (!((_a = groups[msg.groupId]) === null || _a === void 0 ? void 0 : _a.has(currentUserId))) {
                            ws.send(JSON.stringify({ type: 'error', message: 'You are not a member of this group' }));
                            return;
                        }
                        if (groups[msg.groupId]) {
                            groups[msg.groupId].forEach(uid => {
                                if (users[uid] && uid !== currentUserId) {
                                    users[uid].send(JSON.stringify({
                                        from: currentUserId,
                                        groupId: msg.groupId,
                                        content: msg.content,
                                        type: 'group_message',
                                        timestamp: new Date().toISOString()
                                    }));
                                }
                            });
                        }
                        break;
                }
            }
            catch (e) {
                logger.error('WebSocket message error', e);
            }
        }));
        ws.on('close', () => {
            if (currentUserId) {
                delete users[currentUserId];
                Object.values(groups).forEach(set => set.delete(currentUserId));
            }
            logger.info('WebSocket connection closed');
        });
    });
}
