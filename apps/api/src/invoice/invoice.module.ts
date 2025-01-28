import { Module } from '@nestjs/common'
import { InvoiceController } from './invoice.controller'
import { InvoiceService } from './invoice.service'
import { PrismaService } from '../prisma.service'
import { BotModule } from '../bot/bot.module'
import { TonModule } from '../ton/ton.module'

@Module({
  imports: [BotModule, TonModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, PrismaService],
})
export class InvoiceModule {}
