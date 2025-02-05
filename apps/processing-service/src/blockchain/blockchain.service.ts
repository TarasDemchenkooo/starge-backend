import { Injectable } from "@nestjs/common"
import { Address, beginCell, Cell, internal, OutAction, SendMode, storeOutList, toNano } from "@ton/core"
import { sign } from "@ton/crypto"
import { ExternalMessage } from "./types/external"
import { InternalMessage } from "./types/internal"
import { TonClient } from "@ton/ton"
import { WalletMetadata } from "./types/metadata"
import { ConfigService } from "@nestjs/config"
import { PaidRequestDto } from "@shared"

@Injectable()
export class BlockchainService {
    private readonly client: TonClient
    private readonly walletMetadata: WalletMetadata
    private readonly INTERNAL_TRANSFER = 0xae42e5a4
    private readonly JETTON_TRANSFER = 0x0f8a7ea5

    constructor(private readonly configService: ConfigService) {
        this.client = new TonClient({
            endpoint: this.configService.get('TONCENTER_URL'),
            apiKey: this.configService.get('TONCENTER_KEY')
        })

        this.walletMetadata = {
            address: this.configService.get('WALLET_ADDRESS'),
            jettonAddress: this.configService.get('JETTON_WALLET_ADDRESS'),
            secretKey: Buffer.from(this.configService.get('WALLET_SECRET_KEY')),
            subwalletId: Number(this.configService.get('WALLET_ID')),
            timeout: Number(this.configService.get('WALLET_TIMEOUT'))
        }
    }

    async sendBatch(batch: PaidRequestDto[], queryId: number): Promise<string> {
        const outActions = this.packActions(batch, queryId)

        const internalMessage = this.buildInternal({
            address: this.walletMetadata.address,
            queryId,
            outActions
        })

        const externalMessage = this.buildExternal({
            address: this.walletMetadata.address,
            secretKey: this.walletMetadata.secretKey,
            internalMessage,
            queryId,
            subwalletId: this.walletMetadata.subwalletId,
            timeout: this.walletMetadata.timeout,
            createdAt: Math.floor(Date.now() / 1000) - 60
        })

        try {
            await this.client.sendFile(externalMessage.toBoc())
        } catch (error) {
            throw new Error(`Error while sending an external message.\nReason: ${error}`)
        }

        return externalMessage.hash().toString('hex')
    }

    private buildExternal(external: ExternalMessage) {
        const ext_msg_body = beginCell()
            .storeUint(external.subwalletId, 32)
            .storeRef(external.internalMessage)
            .storeUint(SendMode.PAY_GAS_SEPARATELY, 8)
            .storeUint(external.queryId, 23)
            .storeUint(external.createdAt, 64)
            .storeUint(external.timeout, 22)
            .endCell()

        const signed_ext_msg_body = beginCell()
            .storeBuffer(sign(ext_msg_body.hash(), external.secretKey))
            .storeRef(ext_msg_body)
            .endCell()

        const ext_msg = beginCell()
            .storeUint(0b10, 2)
            .storeAddress(undefined)
            .storeAddress(Address.parse(external.address))
            .storeCoins(0n)
            .storeUint(0, 2)
            .storeBuilder(signed_ext_msg_body.asBuilder())
            .endCell()

        return ext_msg
    }

    private buildInternal(internal: InternalMessage) {
        const out_actions_builder = beginCell()
        storeOutList(internal.outActions)(out_actions_builder)
        const out_actions_cell = out_actions_builder.endCell()

        const int_msg_body = beginCell()
            .storeUint(this.INTERNAL_TRANSFER, 32)
            .storeUint(internal.queryId, 64)
            .storeRef(out_actions_cell)
            .endCell()

        const int_msg = beginCell()
            .storeUint(0x10, 6)
            .storeAddress(Address.parse(internal.address))
            .storeCoins(toNano(1))
            .storeUint(0, 107)
            .storeSlice(int_msg_body.asSlice())
            .endCell()

        return int_msg
    }

    private packActions(batch: PaidRequestDto[], queryId: number) {
        let out_actions: OutAction[]

        if (this.configService.get('ASSET') === 'TON') {
            out_actions = batch.map(message => ({
                type: 'sendMsg',
                mode: SendMode.PAY_GAS_SEPARATELY,
                outMsg: internal({
                    to: Address.parse(message.address),
                    value: toNano(message.amount),
                    bounce: false
                })
            }))
        } else {
            out_actions = batch.map(message => ({
                type: 'sendMsg',
                mode: SendMode.PAY_GAS_SEPARATELY,
                outMsg: internal({
                    to: Address.parse(this.walletMetadata.jettonAddress),
                    value: toNano(0.05),
                    bounce: false,
                    body: this.buildJettonTransfer(message.address, message.amount, queryId)
                })
            }))
        }

        return out_actions
    }

    private buildJettonTransfer(address: string, amount: number, queryId: number): Cell {
        const precision = Number(this.configService.get('ASSET_PRECISION'))

        return beginCell()
            .storeUint(this.JETTON_TRANSFER, 32)
            .storeUint(queryId, 64)
            .storeCoins(amount * 10 ** precision)
            .storeAddress(Address.parse(address))
            .storeAddress(Address.parse(this.walletMetadata.address))
            .storeBit(0)
            .storeCoins(1)
            .storeBit(0)
            .endCell()
    }
}