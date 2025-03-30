import { WinstonModuleOptions } from "nest-winston"
import { format, transports } from "winston"

export const winstonConfig: WinstonModuleOptions = {
    level: 'info',
    defaultMeta: { external_log: true },
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [new transports.Console()]
}
