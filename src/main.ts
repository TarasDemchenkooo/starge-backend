import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('/api')
  app.enableCors({
    origin: ['https://95fd-141-11-207-167.ngrok-free.app']
  })
  await app.listen(process.env.PORT)
}

bootstrap()
