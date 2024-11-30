import { Module } from '@nestjs/common'
import { CleanupService } from './cleanup.service'
import { PrismaService } from 'src/prisma.service'

@Module({
  controllers: [],
  providers: [CleanupService, PrismaService],
})
export class CleanupModule {}
