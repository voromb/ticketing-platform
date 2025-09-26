import dotenv from 'dotenv';
dotenv.config();

export const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3003'),
    HOST: process.env.HOST || '0.0.0.0',

    DATABASE_URL: process.env.DATABASE_URL!,

    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
    RABBITMQ_EXCHANGE: process.env.RABBITMQ_EXCHANGE || 'ticketing_events',

    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:4200',
    API_PREFIX: process.env.API_PREFIX || '/api/v1',
    API_VERSION: process.env.API_VERSION || '1.0.0',

    SWAGGER_ENABLED: process.env.SWAGGER_ENABLED !== 'false',
    SWAGGER_HOST: process.env.SWAGGER_HOST || 'localhost:3003',

    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || '10'),
};
