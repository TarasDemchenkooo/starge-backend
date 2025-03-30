import { Module } from '@nestjs/common'
import { NotificationModule } from './notification/notification.module'
import { ConfigModule } from '@nestjs/config'
import { WinstonModule } from 'nest-winston'
import { winstonConfig } from '@shared'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        WinstonModule.forRoot(winstonConfig),
        NotificationModule
    ]
})

export class AppModule { }
