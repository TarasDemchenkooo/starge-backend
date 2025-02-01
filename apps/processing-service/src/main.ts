import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  const processingAsset = process.env.ASSET

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: `${processingAsset}-processing`,
          brokers: ['localhost:29092']
        },
        consumer: {
          groupId: `${processingAsset}-processing`
        }
      }
    }
  )

  app.listen()
}

bootstrap()
