import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConsumerConfig } from './config/kafka/consumer.config'

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, ConsumerConfig)

  app.listen()
}

bootstrap()
