import { Module } from '@nestjs/common'
import { CleanerService } from './cleaner.service'
import { PrismaService } from 'src/prisma.service'

@Module({
  controllers: [],
  providers: [CleanerService, PrismaService],
  exports: [CleanerService]
})
export class CleanerModule {}
