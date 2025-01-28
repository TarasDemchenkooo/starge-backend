import { WithdrawalRequestDto } from "libs/dto/request.dto"

export interface Message {
    message: WithdrawalRequestDto
    partition: number
    offset: string
}