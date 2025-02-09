import { PaidRequestDto } from "@shared"

export interface JobData {
    hash: string,
    batch: PaidRequestDto[]
}