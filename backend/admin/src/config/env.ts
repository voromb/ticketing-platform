import dotenv from 'dotenv';
import path from 'path';

import dotenv from 'dotenv';
import path from 'path';

// Suprimir completamente todos los mensajes de dotenv/dotenvx
process.env.DOTENV_CONFIG_DEBUG = 'false';
process.env.DOTENV_CONFIG_SILENT = 'true';
process.env.DOTENVX_QUIET = 'true';

dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
    override: false,
    processEnv: process.env,
    debug: false,
});

export const ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3003', 10),
    DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://admin:admin123@localhost:5432/ticketing?schema=public',
    JWT_SECRET: process.env.JWT_SECRET || 'DAW-servidor-2025', // Mismo secret que user-service
    RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

// Verificar configuración crítica
if (!ENV.JWT_SECRET || ENV.JWT_SECRET === 'your-secret-key-please-change-in-production') {
    console.warn(
        '[WARNING] Using default JWT_SECRET. Please set a secure JWT_SECRET in production!'
    );
}

// Log de configuración (solo en desarrollo)
if (ENV.NODE_ENV === 'development') {
    console.log('[CONFIG] Environment Configuration:');
    console.log(`   - NODE_ENV: ${ENV.NODE_ENV}`);
    console.log(`   - PORT: ${ENV.PORT}`);
    console.log(`   - DATABASE: ${ENV.DATABASE_URL.split('@')[1] || 'configured'}`);
    console.log(`   - JWT_SECRET: ${ENV.JWT_SECRET.substring(0, 10)}...`);
}

export default ENV;
