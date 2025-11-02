"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
const compression_1 = __importDefault(require("compression"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, compression_1.default)({
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression_1.default.filter(req, res);
        },
        threshold: 1024,
    }));
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
            queue: 'approval_requests',
            queueOptions: {
                durable: true,
            },
        },
    });
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:4200',
        credentials: true,
        exposedHeaders: ['X-User-Id', 'X-User-Name', 'X-User-Type'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Name', 'X-User-Type'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Messaging Service API')
        .setDescription('Sistema de mensajería interna y notificaciones para Ticketing Platform')
        .setVersion('1.0')
        .addBearerAuth()
        .addServer('http://localhost:3005', 'Development Server')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.startAllMicroservices();
    console.log('🐰 RabbitMQ Microservice started');
    const port = process.env.PORT || 3005;
    await app.listen(port);
    console.log(`🚀 Messaging Service running on http://localhost:${port}`);
    console.log(`📚 Swagger documentation available at http://localhost:${port}/api/docs`);
}
bootstrap().catch((error) => {
    console.error('❌ Failed to start Messaging Service:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map