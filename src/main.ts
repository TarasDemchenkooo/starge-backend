import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('/api')
  app.enableCors({
    origin: ['https://a2e6-94-141-126-35.ngrok-free.app']
  })
  await app.listen(process.env.PORT)
}

bootstrap()
