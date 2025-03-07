import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common'
import { UserService } from './user.service'
import { User } from './decorators/user.decorator'
import { UpdateSettingsDto } from './dto/settings.dto'
import { AuthGuard } from '@nestjs/passport'
import { InvoiceDto } from '@shared'

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('invoice')
    async openInvoice(@Body() invoice: InvoiceDto) {
        return this.userService.generateLink(invoice)
    }

    @Get('history')
    getHistory(@User() id: string) {
        return this.userService.getHistory(id)
    }

    @Get('settings')
    async getSettings(@User() id: string) {
        return this.userService.getSettings(id)
    }

    @Patch('settings')
    async updateSettings(@User() id: string, @Body() updateSettingsDto: UpdateSettingsDto) {
        return this.userService.updateSettings(id, updateSettingsDto)
    }
}
