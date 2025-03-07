import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { InitDataGuard } from './guards/initData.guard'
import { InitDataPipe } from './pipes/initData.pipe'
import { UserService } from '../user/user.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  @Post('')
  @UseGuards(InitDataGuard)
  async auth(@Body('initData', InitDataPipe) userId: string) {
    await this.userService.create(userId)
    const jwt = this.authService.generateJwt(userId)

    return { jwt }
  }
}
