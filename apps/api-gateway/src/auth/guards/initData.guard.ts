import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as crypto from 'crypto'

@Injectable()
export class InitDataGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) { }

    private validate(initData: string) {
        const botToken = this.configService.get('BOT_TOKEN')
        const query = new URLSearchParams(initData)

        const hash = query.get("hash")
        query.delete("hash")

        const queryArr = Array.from(query.entries())
        const dataCheckString = queryArr.map(([key, value]) => `${key}=${value}`)
            .sort().join("\n")

        const secretHash = crypto.createHmac('sha256', 'WebAppData')
            .update(botToken).digest()
        const dataHash = crypto.createHmac('sha256', secretHash)
            .update(dataCheckString).digest('hex')

        return hash === dataHash
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest()
        const initData = request.body?.initData

        if (!initData) {
            throw new UnauthorizedException('InitData required')
        }

        const isValidated = this.validate(initData)

        if (!isValidated) {
            throw new UnauthorizedException('initData is not valid')
        }

        return true
    }
}