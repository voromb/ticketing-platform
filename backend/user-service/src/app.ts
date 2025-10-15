import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

// Configuración
dotenv.config();

// Importar configuraciones
import { connectDB } from './config/database';
import { connectRabbitMQ } from './config/rabbitmq';
import { setupSwagger } from './config/swagger';

// Importar rutas
import eventRoutes from './routes/event.routes';
import ticketRoutes from './routes/ticket.routes';
import userManagementRoutes from './routes/user-management.routes';

class App {
    public app: Application;
    private port: string | number;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3001;

        this.initializeMiddlewares();
        this.initializeSwagger();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.initializeDatabase();
        this.initializeMessageBroker();
    }

    private initializeMiddlewares(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(compression());
        this.app.use(morgan('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initializeSwagger(): void {
        setupSwagger(this.app);
    }

    private initializeRoutes(): void {
        // Health check
        this.app.use('/api/auth', authRoutes);

        /**
         * @swagger
         * /health:
         *   get:
         *     summary: Health check del servicio
         *     tags: [Health]
         *     responses:
         *       200:
         *         description: Servicio operativo
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                   example: ok
         *                 service:
         *                   type: string
         *                   example: user-service
         *                 timestamp:
         *                   type: string
         *                   format: date-time
         *                   example: 2025-10-15T17:00:00.000Z
         */
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({
                status: 'ok',
                service: 'user-service',
                timestamp: new Date().toISOString(),
            });
        }); // API routes
        this.app.use('/api/events', eventRoutes);
        this.app.use('/api/tickets', ticketRoutes);
        this.app.use('/api/users', userManagementRoutes);
    }

    private initializeErrorHandling(): void {
        // 404 handler - Sin usar '*'
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.status(404).json({
                success: false,
                error: 'Route not found',
                path: req.originalUrl,
            });
        });

        // Error handler general
        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            const status = err.status || 500;
            const message = err.message || 'Internal server error';

            console.error('Error:', err);

            res.status(status).json({
                success: false,
                error: message,
            });
        });
    }

    private async initializeDatabase(): Promise<void> {
        try {
            await connectDB();
            console.log('[MONGODB] MongoDB connected');
        } catch (error) {
            console.error('[MONGODB] MongoDB connection error:', error);
            process.exit(1);
        }
    }

    private async initializeMessageBroker(): Promise<void> {
        try {
            await connectRabbitMQ();
            console.log('[RABBITMQ] RabbitMQ connected');
        } catch (error) {
            console.error('[RABBITMQ] RabbitMQ connection error:', error);
            // No salimos, el servicio puede funcionar sin RabbitMQ
        }
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log(`[SERVER] User Service running on port ${this.port}`);
        });
    }
}

export default App;
