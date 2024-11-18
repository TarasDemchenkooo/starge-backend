import { Body, Controller, Patch, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { UserService } from './user.service'
import { User } from './decorators/user.decorator'
import { UpdateSettingsDto } from './dto/settings.dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Patch()
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  updateSettings(@User() id, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.userService.updateUserSettings(id, updateSettingsDto)
  }
}
