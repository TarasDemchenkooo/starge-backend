import { PaidRequestDto } from "@shared"

export interface Message {
    message: PaidRequestDto
    partition: number
    offset: string
}