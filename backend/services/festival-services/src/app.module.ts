import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { TravelModule } from './travel/travel.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { MerchandisingModule } from './merchandising/merchandising.module';
import { ApprovalModule } from './approval/approval.module';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),

    // Conexión a MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),

    TravelModule,
    RestaurantModule,
    MerchandisingModule,
    ApprovalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
