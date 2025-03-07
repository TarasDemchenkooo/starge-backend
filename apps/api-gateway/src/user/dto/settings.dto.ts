import { IsBoolean } from "class-validator"

export class UpdateSettingsDto {
    @IsBoolean()
    notifications: boolean
}
