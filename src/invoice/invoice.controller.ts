import { Body, Controller, Get, Param, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { InvoiceService } from './invoice.service'
import { User } from 'src/user/decorators/user.decorator'
import { InvoiceDto } from './dto/invoice.dto'
import { AuthGuard } from '@nestjs/passport'
import { TonService } from 'src/ton/ton.service'

@Controller('invoice')
@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true
}))
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly tonService: TonService
  ) { }

  @Post('')
  async openInvoice(@User() id: number, @Body() { address, source, target, route }: InvoiceDto) {
    await this.tonService.validateExchangeAmount(source, target, route)
    const { lpFee, bchFees } = await this.tonService.calculateFees(source, address)

    return this.invoiceService.openInvoice(id, { address, source, target, route }, lpFee, bchFees)
  }

  @Get('/:hash')
  generateLink(@User() id: number, @Param('hash') hash: string) {
    return this.invoiceService.generateLink(id, hash)
  }
}
