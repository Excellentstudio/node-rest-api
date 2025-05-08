"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const winston_1 = __importDefault(require("winston"));
const websocket_1 = require("./websocket");
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const db_1 = __importDefault(require("./config/db"));
const errorHandler_1 = require("./middleware/errorHandler");
const adminSeeder_1 = require("./seeders/adminSeeder");
const path_1 = __importDefault(require("path"));
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const app = express();
const server = http_1.default.createServer(app);
// Logging setup
const logger = winston_1.default.createLogger({
    transports: [
        new winston_daily_rotate_file_1.default({
            filename: 'logs/api-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
        }),
        new winston_1.default.transports.Console(),
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
app.use(express.static(path_1.default.join(__dirname, '../public')));
const userSwaggerSpec = (0, swagger_jsdoc_1.default)({
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
const adminSwaggerSpec = (0, swagger_jsdoc_1.default)({
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
app.get('/api', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/home.html'));
});
// Add routes
app.use('/api/users', require('./routes/user').default);
app.use('/api/groups', require('./routes/group').default);
app.use('/api/admins', require('./routes/admin').default);
// WebSocket setup
(0, websocket_1.setupWebSocket)(server, logger);
(0, db_1.default)();
(0, adminSeeder_1.seedAdmin)();
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
