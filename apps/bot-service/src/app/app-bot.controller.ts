import { Controller, ValidationPipe } from "@nestjs/common"
import { MessagePattern, Payload } from "@nestjs/microservices"
import { AppBotService } from "./app-bot.service"
import { InvoiceDto } from "@shared"

@Controller()
export class AppBotController {
    constructor(private readonly appBotService: AppBotService) { }

    @MessagePattern('payments')
    async generateLink(@Payload(ValidationPipe) paymentData: InvoiceDto) {
        const invoiceLink = await this.appBotService.generatePaymentLink(paymentData)
        return { invoiceLink }
    }
}