import { Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ClientKafka, KafkaContext } from "@nestjs/microservices"
import { Consumer } from "@nestjs/microservices/external/kafka.interface"
import { Message } from "./types/message"
import { BlockchainService } from "../blockchain/blockchain.service"
import { Address, TonClient } from "@ton/ton"
import { BatchConfig } from "./types/batchConfig"
import { PaidRequestDto } from "@shared"
import { DatabaseService } from "@db"
import { Cron } from "@nestjs/schedule"
import { WalletConfig } from "./types/walletConfig"

@Injectable()
export class ProcessingService {
    private buffer: Message[] = []
    private timer: NodeJS.Timeout
    private messageQueue: []
    private timeoutHandler: NodeJS.Timeout | null = null
    private isProcessing: Boolean = false
    private processingPromise: Promise<void> | null = null
    private queryId: number = 0
    private readonly client: TonClient
    private readonly batchConfig: BatchConfig
    private readonly walletConfig: WalletConfig

    constructor(
        private readonly configService: ConfigService,
        private readonly db: DatabaseService,
        private readonly blockchainService: BlockchainService,
        //@Inject('BATCH_MONITORING_SERVICE') private readonly batchMonitoringProducer: ClientKafka
    ) {
        this.client = new TonClient({
            endpoint: this.configService.get('TON_API_URL'),
            apiKey: this.configService.get('TON_API_KEY')
        })

        this.batchConfig = {
            size: Number(configService.get('BATCH_SIZE')),
            timeout: Number(configService.get('BATCH_TIMEOUT')) * 1000
        }

        this.walletConfig = {
            address: this.configService.get('WALLET_ADDRESS'),
            timeout: Number(this.configService.get('WALLET_TIMEOUT'))
        }

        // const walletState = await db.wallet.findUnique({
        //     where: { address: this.walletConfig.address }
        // })

        // this.queryId = walletState.queryId
        // this.scheduleTimeout()
    }

    // @Cron('*/5 * * * *')
    // private async resetQueryId() {
    //     const result = await this.client.runMethod(Address.parse(this.walletConfig.address), 'get_last_clean_time', [])
    //     const lastCleanTime = result.stack.readNumber()
    //     const now = Math.floor(Date.now() / 1000)

    //     if (now - lastCleanTime > 2 * this.walletConfig.timeout) {
    //         await this.db.wallet.update({
    //             where: { address: this.walletConfig.address },
    //             data: { queryId: 0 }
    //         })
    //     }
    // }

    // private scheduleTimeout(): void {
    //     if (this.timeoutHandler) {
    //         clearTimeout(this.timeoutHandler)
    //     }

    //     this.timeoutHandler = setTimeout(() => {
    //         this.processQueueByTimeout()
    //     }, 0)
    // }

    // async addMessage(message: never): Promise<void> {
    //     this.messageQueue.push(message)

    //     if (this.messageQueue.length >= 0) {
    //         if (this.timeoutHandler) {
    //             clearTimeout(this.timeoutHandler)
    //             this.timeoutHandler = null
    //         }
    //     } else {
    //         this.scheduleTimeout()
    //     }

    //     if (!this.isProcessing) {
    //         await this.processQueue()
    //     }
    // }

    // private async processQueueByTimeout() {
    //     if (this.messageQueue.length > 0 && !this.isProcessing) {
    //         await this.processQueue(true)
    //     }
    // }

    // private async processQueue(byTimeout = false) {
    //     if (this.isProcessing) {
    //         return this.processingPromise
    //     }

    //     this.isProcessing = true
    //     // this.processingPromise = (async () => {
    //     //     try {
    //     //         while (this.messageQueue.length > 0) {

    //     //             if (!byTimeout && this.messageQueue.length < 0) {
    //     //                 break
    //     //             }

    //     //             const batchSize = Math.min(this.messageQueue.length, 0)
    //     //             const batch = this.messageQueue.slice(0, batchSize)

    //     //             try {
    //     //                 const ext_hash = await this.blockchainService.sendBatch(
    //     //                     this.client,
    //     //                     batch,
    //     //                     this.queryId,
    //     //                     Math.floor(Date.now() / 1000) - 60
    //     //                 )
    //     //             }
    //     //         }
    //     //     }
    //     // })()

    //     return this.processingPromise
    // }

    // addToBatch(data: PaidRequestDto, context: KafkaContext) {
    //     const consumer = context.getConsumer()

    //     this.buffer.push({
    //         message: data,
    //         partition: context.getPartition(),
    //         offset: context.getMessage().offset
    //     })

    //     if (this.buffer.length === 1) {
    //         this.processTransaction(this.buffer, consumer)
    //     } else {
    //         if (!this.timer) {
    //             this.timer = setTimeout(() => {
    //                 if (this.buffer.length !== 0) {
    //                     this.processTransaction(this.buffer, consumer)
    //                 }
    //             }, this.batchConfig.timeout)
    //         }
    //     }
    // }

    // async processTransaction(batch: Message[], consumer: Consumer) {
    //     const topic = `${this.configService.get('ASSET')}-requests`
    //     const partitions = [...new Set(batch.map(message => message.partition))]
    //     consumer.pause([{ topic, partitions }])
    //     clearTimeout(this.timer)
    //     this.timer = undefined
    //     this.buffer = []

    //     try {
    //         const walletInfo = await this.db.wallet.update({
    //             where: { address: this.walletConfig.address },
    //             data: { queryId: { increment: 1 } }
    //         })

    //         if (walletInfo.status !== 'ACTIVE') {
    //             throw new Error('...')
    //         }

    //         const createdAt = Math.floor(Date.now() / 1000) - 60
    //         await this.blockchainService.sendBatch(this.client, batch, walletInfo.queryId, createdAt)
    //         this.batchMonitoringProducer.emit(`${this.configService.get('ASSET')}-batches`, '')
    //     } catch (error) {
    //         console.error(error)
    //     } finally {
    //         consumer.resume([{ topic, partitions }])
    //     }
    // }
}