export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  mongodb: {
    uri:
      process.env.MONGODB_URI || 'mongodb://localhost:27017/festival_services',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret-key',
    expiration: process.env.JWT_EXPIRATION || '1d',
  },
});
