import { BadRequestException, Body, Controller, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
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
  updateSettings(@User() id, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.userService.updateUserSettings(id, updateSettingsDto)
  }

  @Post('invoice')
  async openInvoice(@User() id, @Body() { address, source, target, route }: InvoiceDto) {
    const isAcceptableSlippage = await this.paymentsService.validateExchangeAmount(source, target, route)

    if (!isAcceptableSlippage) {
      throw new BadRequestException('Expected exchange amount does not match the actual one')
    }

    const { lpFee, bchFees } = await this.paymentsService.calculateFees(source, address)

    return this.paymentsService.openInvoice(id, { address, source, target, route }, lpFee, bchFees)
  }
}
