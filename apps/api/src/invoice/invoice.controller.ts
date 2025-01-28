import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { InvoiceService } from './invoice.service'
import { InvoiceDto } from './dto/invoice.dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('invoice')
@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true
}))
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) { }

  @Post('')
  async openInvoice(@Body() invoice: InvoiceDto) {
    return this.invoiceService.generateLink(invoice)
  }
}
