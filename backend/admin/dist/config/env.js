"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Cargar variables de entorno
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
exports.ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3003', 10),
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://admin:admin123@localhost:5432/ticketing?schema=public',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-please-change-in-production',
    RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};
// Verificar configuración crítica
if (!exports.ENV.JWT_SECRET || exports.ENV.JWT_SECRET === 'your-secret-key-please-change-in-production') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Please set a secure JWT_SECRET in production!');
}
// Log de configuración (solo en desarrollo)
if (exports.ENV.NODE_ENV === 'development') {
    console.log('📋 Environment Configuration:');
    console.log(`   - NODE_ENV: ${exports.ENV.NODE_ENV}`);
    console.log(`   - PORT: ${exports.ENV.PORT}`);
    console.log(`   - DATABASE: ${exports.ENV.DATABASE_URL.split('@')[1] || 'configured'}`);
    console.log(`   - JWT_SECRET: ${exports.ENV.JWT_SECRET.substring(0, 10)}...`);
}
exports.default = exports.ENV;
