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
        name: 'PAYMENT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment',
            brokers: ['localhost:29092'],
          },
          consumer: {
            groupId: 'payment-service'
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
