import { Ctx, On, Update } from "nestjs-telegraf"
import { Context } from "telegraf"
import { BotService } from "./bot.service"
import ExtendedContext from "./types/ExtendedContext"

@Update()
export class BotUpdate {
    constructor(private readonly botService: BotService) { }

    @On('pre_checkout_query')
    async preCheckoutQuery(@Ctx() ctx: Context) {
        const invoice = ctx.preCheckoutQuery.invoice_payload

        try {
            await this.botService.checkPayment(invoice)
            await this.botService.processPayment(String(ctx.preCheckoutQuery.from.id), invoice, 'ruchejnzy748ddhnwojsh8337378dn')
            //await ctx.answerPreCheckoutQuery(true)
        } catch (error) {
            await ctx.answerPreCheckoutQuery(false, error.message)
        }
    }

    @On('successful_payment')
    async successfulPayment(@Ctx() ctx: ExtendedContext) {
        const userId = String(ctx.message.from.id)
        const invoice = ctx.message.successful_payment.invoice_payload
        const chargeId = ctx.message.successful_payment.telegram_payment_charge_id

        await this.botService.processPayment(userId, invoice, chargeId)
    }
}