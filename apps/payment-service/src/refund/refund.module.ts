import { Module } from "@nestjs/common"
import { RefundService } from "./refund.service"

@Module({
    providers: [RefundService]
})
export class RefundModule {}
