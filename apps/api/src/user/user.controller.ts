import {
  Body, Controller, Get, Patch,
  UseGuards, UsePipes, ValidationPipe
} from '@nestjs/common'
import { UserService } from './user.service'
import { User } from './decorators/user.decorator'
import { UpdateSettingsDto } from './dto/settings.dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('user')
@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true
}))
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @Patch()
  updateSettings(@User() id: string, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.userService.updateUserSettings(id, updateSettingsDto)
  }

  @Get('history')
  getHistory(@User() id: string) {
    return this.userService.getHistory(id)
  }
}
