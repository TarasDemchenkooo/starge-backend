import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { PrismaService } from 'src/prisma.service'
import { PaymentsModule } from 'src/payments/payments.module'

@Module({
  imports: [PaymentsModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService]
})

export class UserModule {}
