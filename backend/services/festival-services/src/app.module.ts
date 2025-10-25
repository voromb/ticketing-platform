import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TravelModule } from './travel/travel.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { MerchandisingModule } from './merchandising/merchandising.module';
import { OrderModule } from './order/order.module';
// import { ApprovalModule } from './approval/approval.module'; // Temporalmente deshabilitado hasta crear tabla en PostgreSQL
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { UploadModule } from './upload/upload.module';
import { SecurityMiddleware } from './auth/middleware/security.middleware';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/festival_services'),
    RabbitmqModule,
    PrismaModule,
    AuthModule,
    TravelModule,
    RestaurantModule,
    MerchandisingModule,
    OrderModule,
    // ApprovalModule, // Temporalmente deshabilitado hasta crear tabla en PostgreSQL
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .exclude('api/upload/(.*)')  // Excluir rutas de upload
      .forRoutes('*'); // Aplicar a todas las demás rutas
  }
}