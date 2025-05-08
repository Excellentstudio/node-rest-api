import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import DailyRotateFile from 'winston-daily-rotate-file';
import winston from 'winston';
import { setupWebSocket } from './websocket';
import swaggerJSDoc from 'swagger-jsdoc';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { seedAdmin } from './seeders/adminSeeder';

import path from 'path';

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const app = express();
const server = http.createServer(app);

// Logging setup
const logger = winston.createLogger({
  transports: [
    new DailyRotateFile({
      filename: 'logs/api-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
    new winston.transports.Console(),
  ],
});

// Rate limiting
const limiter = rateLimit.default({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

app.use(cors());
app.use(express.json());
app.set('trust proxy', 1); // Enable trust proxy for express-rate-limit
app.use(limiter);

app.use(express.static(path.join(__dirname, '../public')));

const userSwaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'User API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    __dirname + '/routes/user.ts',
    __dirname + '/routes/group.ts',
  ],
});

const adminSwaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Admin API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    __dirname + '/routes/admin.ts',
  ],
});

// Swagger docs setup with custom options
app.use('/api/docs/user', swaggerUi.serveFiles(userSwaggerSpec, {}), swaggerUi.setup(userSwaggerSpec, { 
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true
  }
}));

app.use('/api/docs/admin', swaggerUi.serveFiles(adminSwaggerSpec, {}), swaggerUi.setup(adminSwaggerSpec, {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true
  }
}));


app.get('/api', (req: any, res: any) => {
  res.sendFile(path.join(__dirname, '../public/home.html'));
});

// Add routes
app.use('/api/users', require('./routes/user').default);
app.use('/api/groups', require('./routes/group').default);
app.use('/api/admins', require('./routes/admin').default);

// WebSocket setup
setupWebSocket(server, logger);

connectDB();
seedAdmin();

app.use(errorHandler);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
