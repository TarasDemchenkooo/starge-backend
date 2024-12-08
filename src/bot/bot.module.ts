import { Module } from '@nestjs/common'
import { BotService } from './bot.service'
import { PrismaService } from 'src/prisma.service'
import { UserModule } from 'src/user/user.module'
import { TonModule } from 'src/ton/ton.module'

@Module({
  imports: [UserModule, TonModule],
  controllers: [],
  providers: [BotService, PrismaService],
  exports: [BotService]
})
export class BotModule {}
