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

  @Patch('settings')
  updateSettings(@User() id: string, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.userService.updateUserSettings(id, updateSettingsDto)
  }

  @Post('invoice')
  async openInvoice(@Body() invoice: InvoiceDto) {
    return this.userService.generateLink(invoice)
  }

  @Get('history')
  getHistory(@User() id: string) {
    return this.userService.getHistory(id)
  }
}
