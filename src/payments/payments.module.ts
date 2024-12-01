import { Module } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { PaymentsController } from './payments.controller'
import { PrismaService } from 'src/prisma.service'
import { BotModule } from 'src/bot/bot.module'

@Module({
  imports: [BotModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService],
  exports: [PaymentsService]
})
export class PaymentsModule {}
