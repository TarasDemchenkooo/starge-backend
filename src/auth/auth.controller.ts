import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ValidationGuard } from './guards/validation.guard'
import { ValidationPipe } from './pipes/validation.pipe'
import { UserService } from 'src/user/user.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  @Post('')
  @UseGuards(ValidationGuard)
  async auth(@Body('initData', ValidationPipe) userId: string) {
    const user = await this.userService.findOrCreate(userId)
    const jwt = this.authService.generateJwt(userId)

    return { user, jwt }
  }
}
