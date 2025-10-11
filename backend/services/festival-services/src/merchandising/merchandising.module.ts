import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MerchandisingService } from './merchandising.service';
import { MerchandisingController } from './merchandising.controller';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])
  ],
  controllers: [MerchandisingController],
  providers: [MerchandisingService],
  exports: [MerchandisingService]
})
export class MerchandisingModule {}