import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { DatabaseModule } from '@db'

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'TELEGRAM_PAYMENT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'telegram-payment',
            brokers: ['localhost:29092'],
          },
          consumer: {
            groupId: 'telegram-payment'
          }
        },
      },
    ])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})

export class UserModule { }
