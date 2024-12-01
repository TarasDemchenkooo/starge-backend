import {
  Body, Controller, Get, Patch,
  Post, Query, UseGuards, UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { UserService } from './user.service'
import { User } from './decorators/user.decorator'
import { UpdateSettingsDto } from './dto/settings.dto'
import { AuthGuard } from '@nestjs/passport'
import { PaymentsService } from 'src/payments/payments.service'
import { InvoiceDto } from 'src/payments/dto/invoice.dto'

@Controller('user')
@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true
}))
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly paymentsService: PaymentsService
  ) { }

  @Patch()
  updateSettings(@User() id: number, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.userService.updateUserSettings(id, updateSettingsDto)
  }

  @Post('invoice')
  async openInvoice(@User() id: number, @Body() { address, source, target, route }: InvoiceDto) {
    await this.paymentsService.validateExchangeAmount(source, target, route)
    const { lpFee, bchFees } = await this.paymentsService.calculateFees(source, address)

    return this.paymentsService.openInvoice(id, { address, source, target, route }, lpFee, bchFees)
  }

  @Get('invoice')
  async generateLink(@User() id: number, @Query('hash') hash: string) {
    const invoiceLink = await this.paymentsService.generateLink(id, hash)

    return { invoiceLink }
  }
}
