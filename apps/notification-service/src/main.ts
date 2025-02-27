import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { MicroserviceOptions } from '@nestjs/microservices'
import { ConsumerConfig } from './config/consumer.config'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, ConsumerConfig)

  app.listen()
}

bootstrap()
