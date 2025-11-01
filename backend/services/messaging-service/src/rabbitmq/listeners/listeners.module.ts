import { Module } from '@nestjs/common';
import { OrderListener } from './order.listener';
import { ApprovalListener } from './approval.listener';
import { MessageModule } from '../../message/message.module';
import { NotificationModule } from '../../notification/notification.module';

@Module({
  imports: [MessageModule, NotificationModule],
  providers: [OrderListener, ApprovalListener],
})
export class ListenersModule {}
