"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
// Configuración
dotenv_1.default.config();
// Importar configuraciones
const database_1 = require("./config/database");
const rabbitmq_1 = require("./config/rabbitmq");
// Importar rutas
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
class App {
    app;
    port;
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || 3001;
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.initializeDatabase();
        this.initializeMessageBroker();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)());
        this.app.use((0, compression_1.default)());
        this.app.use((0, morgan_1.default)('dev'));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
    }
    initializeRoutes() {
        // Health check
        this.app.use('/api/auth', auth_routes_1.default);
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                service: 'user-service',
                timestamp: new Date().toISOString()
            });
        });
        // API routes
        this.app.use('/api/events', event_routes_1.default);
        this.app.use('/api/tickets', ticket_routes_1.default);
    }
    initializeErrorHandling() {
        // 404 handler - Sin usar '*'
        this.app.use((req, res, next) => {
            res.status(404).json({
                success: false,
                error: 'Route not found',
                path: req.originalUrl
            });
        });
        // Error handler general
        this.app.use((err, req, res, next) => {
            const status = err.status || 500;
            const message = err.message || 'Internal server error';
            console.error('Error:', err);
            res.status(status).json({
                success: false,
                error: message
            });
        });
    }
    async initializeDatabase() {
        try {
            await (0, database_1.connectDB)();
            console.log('✅ MongoDB connected');
        }
        catch (error) {
            console.error('❌ MongoDB connection error:', error);
            process.exit(1);
        }
    }
    async initializeMessageBroker() {
        try {
            await (0, rabbitmq_1.connectRabbitMQ)();
            console.log('✅ RabbitMQ connected');
        }
        catch (error) {
            console.error('❌ RabbitMQ connection error:', error);
            // No salimos, el servicio puede funcionar sin RabbitMQ
        }
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`🚀 User Service running on port ${this.port}`);
        });
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map