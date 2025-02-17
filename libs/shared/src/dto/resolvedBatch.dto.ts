import { IsString } from "class-validator"
import { PaidRequestDto } from "./request.dto"

export class ResolvedBatchDto {
    @IsString()
    hash: string

    batch: PaidRequestDto[]
}