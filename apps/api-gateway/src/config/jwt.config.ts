import { ConfigService } from "@nestjs/config"
import { JwtModuleOptions } from "@nestjs/jwt"

export const buildJwtConfig = (configService: ConfigService): JwtModuleOptions => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: { expiresIn: '0' }
})