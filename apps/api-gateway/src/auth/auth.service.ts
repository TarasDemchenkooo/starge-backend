import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) { }

    generateJwt(userId: string) {
        return this.jwtService.sign({ userId })
    }
}
