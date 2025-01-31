import { Context } from "telegraf"
import { SuccessfulPayment } from "telegraf/typings/core/types/typegram"

type ExtendedContext = Context & { message: { successful_payment: SuccessfulPayment } }

export default ExtendedContext