import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  const processingAsset = process.env.ASSET.toLowerCase()

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `${processingAsset}-processor`,
        brokers: process.env.BROKERS.split(';')
      },
      postfixId: '',
      consumer: {
        groupId: `${processingAsset}-processors`,
        allowAutoTopicCreation: false,
        minBytes: Number(process.env.MIN_BATCH_SIZE),
        maxBytes: Number(process.env.MAX_BATCH_SIZE),
        maxWaitTimeInMs: Number(process.env.REQUEST_TIMEOUT)
      }
    }
  }
  )

  app.listen()
}

bootstrap()
