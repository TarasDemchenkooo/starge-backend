import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { UpdateSettingsDto } from './dto/settings.dto'

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findOrCreate(id: number): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                settings: {
                    select: {
                        tokenSymbol: true,
                        vibration: true,
                        notifications: true
                    }
                }
            }
        })

        if (!user) {
            return this.prisma.user.create({
                data: {
                    id,
                    invoices: { create: [] },
                    transactions: { create: [] },
                    settings: { create: {} }
                },
                select: {
                    id: true,
                    settings: {
                        select: {
                            tokenSymbol: true,
                            vibration: true,
                            notifications: true
                        }
                    }
                }
            })
        }

        return user
    }

    updateUserSettings(id: number, settings: UpdateSettingsDto) {
        return this.prisma.settings.update({
            where: { userId: id },
            data: settings,
            select: {
                tokenSymbol: true,
                vibration: true,
                notifications: true
            }
        })
    }
}
