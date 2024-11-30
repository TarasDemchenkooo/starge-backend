import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { PrismaService } from 'src/prisma.service'
import { PaymentsService } from 'src/payments/payments.service'

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, PaymentsService],
})

export class UserModule {}
