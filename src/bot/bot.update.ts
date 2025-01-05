import { Ctx, On, Update } from "nestjs-telegraf"
import { Context } from "telegraf"
import { BotService } from "./bot.service"

@Update()
export class BotUpdate {
    constructor(private readonly botService: BotService) { }

    @On('pre_checkout_query')
    async preCheckoutQuery(@Ctx() ctx: Context) {
        const invoice = ctx.preCheckoutQuery.invoice_payload

        try {
            await this.botService.checkPayment(invoice)
            //await ctx.answerPreCheckoutQuery(true)
        } catch (error) {
            await ctx.answerPreCheckoutQuery(false, error.message)
        }
    }

    @On('successful_payment')
    async successfulPayment(@Ctx() ctx: Context) {
        const userId = String(ctx.message.from.id)
        //@ts-ignore
        const invoice = ctx.message.successful_payment.invoice_payload

        console.log(userId, invoice)
    }
}