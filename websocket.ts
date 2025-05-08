const WebSocket = require('ws');
import { Server as HTTPServer } from 'http';
import { Logger } from 'winston';
import jwt from 'jsonwebtoken';

interface UserSocket {
  userId: string;
  ws: typeof WebSocket;
}

let users: Record<string, typeof WebSocket> = {};
let groups: Record<string, Set<string>> = {};

export function getWebSocketMaps() {
  return { users, groups };
}

export function setupWebSocket(server: HTTPServer, logger: Logger) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws: typeof WebSocket, req: any) => {
    let currentUserId: string | null = null;
    logger.info('WebSocket connection established');

    ws.on('message', async (data: string) => {
      try {
        const msg = JSON.parse(data);
        switch (msg.type) {
          case 'init':
            try {
              const decoded: any = jwt.verify(msg.token, process.env.JWT_SECRET!);
              currentUserId = decoded.userId;
              if (currentUserId) {
                users[currentUserId] = ws;
                ws.send(JSON.stringify({ type: 'init_success', userId: currentUserId }));
              } else {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
                ws.close();
              }
            } catch (e) {
              ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
              ws.close();
            }
            break;
          case 'direct_message':
            if (!currentUserId) return;
            if (users[msg.to]) {
              users[msg.to].send(JSON.stringify({ from: currentUserId, content: msg.content, type: 'direct_message' }));
            }
            break;
          case 'join_group':
            if (!currentUserId) return;
            if (!groups[msg.groupId]) groups[msg.groupId] = new Set();
            groups[msg.groupId].add(currentUserId);
            ws.send(JSON.stringify({ type: 'joined_group', groupId: msg.groupId }));
            break;
          case 'leave_group':
            if (!currentUserId) return;
            if (groups[msg.groupId]) groups[msg.groupId].delete(currentUserId);
            ws.send(JSON.stringify({ type: 'left_group', groupId: msg.groupId }));
            break;
          case 'group_message':
            if (!currentUserId) return;
            // Verify sender is a member of the group
            if (!groups[msg.groupId]?.has(currentUserId)) {
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
      } catch (e) {
        logger.error('WebSocket message error', e);
      }
    });

    ws.on('close', () => {
      if (currentUserId) {
        delete users[currentUserId];
        Object.values(groups).forEach(set => set.delete(currentUserId!));
      }
      logger.info('WebSocket connection closed');
    });
  });
}