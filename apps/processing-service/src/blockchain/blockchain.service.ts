import { Injectable } from "@nestjs/common"
import { Address, beginCell, Cell, internal, OutAction, SendMode, storeOutList, toNano } from "@ton/core"
import { sign } from "@ton/crypto"
import { ExternalMessage } from "./types/external"
import { InternalMessage } from "./types/internal"
import { TonClient } from "@ton/ton"
import { WalletMetadata } from "./types/metadata"
import { ConfigService } from "@nestjs/config"
import { Batch } from "../processing/types/batch"
import { Transaction } from "@shared"

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
            asset: this.configService.get('ASSET'),
            address: this.configService.get('WALLET_ADDRESS'),
            jettonAddress: this.configService.get('JETTON_WALLET_ADDRESS'),
            secretKey: Buffer.from(this.configService.get('WALLET_SECRET_KEY') as string, 'hex'),
            subwalletId: Number(this.configService.get('WALLET_ID')),
            timeout: Number(this.configService.get('WALLET_TIMEOUT'))
        }
    }

    readPayload(cell: Cell): string {
        const slice = cell.beginParse()
        const buffer = slice.loadBuffer(slice.remainingBits / 8)
        let string = buffer.toString()

        if (slice.remainingRefs > 0) {
            const refCell = slice.loadRef()
            return string += this.readPayload(refCell)
        }

        return string
    }

    async sendBatch({ queryId, batch }: Batch): Promise<string> {
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
            if (!error?.response?.data?.error?.includes('exitcode=36')) throw error
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
            .storeUint(2, 2)
            .storeUint(0, 2)
            .storeAddress(Address.parse(external.address))
            .storeUint(0, 4)
            .storeBit(false)
            .storeBit(true)
            .storeRef(signed_ext_msg_body)
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
            .storeCoins(toNano(this.walletMetadata.asset === 'TON' ? 0.2 : 1))
            .storeUint(0, 107)
            .storeSlice(int_msg_body.asSlice())
            .endCell()

        return int_msg
    }

    private packActions(batch: Transaction[], queryId: number) {
        let out_actions: OutAction[]

        if (this.walletMetadata.asset === 'TON') {
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
                    body: this.buildJettonTransfer(message.address, message.amount, queryId, message.chargeId)
                })
            }))
        }

        return out_actions
    }

    private buildJettonTransfer(address: string, amount: number, queryId: number, payload: string): Cell {
        const precision = Number(this.configService.get('ASSET_PRECISION'))

        return beginCell()
            .storeUint(this.JETTON_TRANSFER, 32)
            .storeUint(queryId, 64)
            .storeCoins(amount * 10 ** precision)
            .storeAddress(Address.parse(address))
            .storeAddress(Address.parse(this.walletMetadata.address))
            .storeBit(1)
            .storeRef(this.writePayload(payload))
            .storeCoins(1)
            .storeBit(0)
            .endCell()
    }

    private writePayload(string: string): Cell {
        const builder = beginCell()
        const bytes = Math.floor(builder.availableBits / 8)

        if (bytes < string.length) {
            builder.storeBuffer(Buffer.from(string.substring(0, bytes)))
            const refCell = this.writePayload(string.substring(bytes))
            builder.storeRef(refCell)
        } else {
            builder.storeBuffer(Buffer.from(string))
        }

        return builder.endCell()
    }
}
