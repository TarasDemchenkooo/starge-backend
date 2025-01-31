import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'payment',
          brokers: ['localhost:29092'],
        },
        consumer: {
          groupId: 'payment-service',
        },
      },
    },
  )

  await app.listen()
}

bootstrap()
