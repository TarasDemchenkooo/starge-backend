import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Cron } from "@nestjs/schedule"
import { Address, TonClient } from "@ton/ton"

@Injectable()
export class MonitoringService {
    private client: TonClient

    constructor(private readonly configService: ConfigService) {
        this.client = new TonClient({
            endpoint: this.configService.get('TON_API_URL'),
            apiKey: this.configService.get('TON_API_KEY')
        })
    }

    @Cron('*/5 * * * *')
    private async resetQueryId() {
        const result = await this.client.runMethod(
            Address.parse(this.configService.get('WALLET_ADDRESS')),
            'get_last_clean_time',
            []
        )
        const lastCleanTime = result.stack.readNumber()
        const now = Math.floor(Date.now() / 1000)

        // if (now - lastCleanTime > Number(this.configService.get('WALLET_TIMEOUT')) * 2) {
        //     try {
        //         await fs.writeFile(this.queryIdPath, JSON.stringify({
        //             queryId: 0
        //         }, null, 4))
        //         console.log('QueryId has been successfully reset')
        //     } catch (error) {
        //         console.error('Error while resetting queryId: ', error)
        //     }
        // }
    }

    getClient() {
        return this.client
    }

    async getQueryId(): Promise<number> {
        // const data = await fs.readFile(this.queryIdPath, 'utf-8')
        // return JSON.parse(data).queryId
        return new Promise(res => res(0))
    }

    async nextQueryId() {
        // const queryId = await this.getQueryId()
        // await fs.writeFile(this.queryIdPath, JSON.stringify({
        //     queryId: queryId + 1
        // }, null, 4))
    }
}