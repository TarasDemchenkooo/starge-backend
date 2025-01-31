import { Ctx, On, Update } from "nestjs-telegraf"
import { Context } from "telegraf"
import ExtendedContext from "./types/extendedContext"
import { AppBotService } from "./app-bot.service"

@Update()
export class AppBotUpdate {
    constructor(private readonly appBotService: AppBotService) { }

    @On('pre_checkout_query')
    async preCheckoutQuery(@Ctx() ctx: Context) {
        const invoice = ctx.preCheckoutQuery.invoice_payload

        try {
            await this.appBotService.checkPayment(invoice)
            await this.appBotService.processPayment(String(ctx.preCheckoutQuery.from.id), invoice, 'ruchejnzy748ddhnwojsh8337378dn')
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

        await this.appBotService.processPayment(userId, invoice, chargeId)
    }
}