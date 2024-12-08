import { Injectable, PipeTransform } from "@nestjs/common"

@Injectable()
export class ValidationPipe implements PipeTransform {
    transform(initData: string) {
        const query = new URLSearchParams(initData)
        const user = JSON.parse(query.get('user'))
        
        return String(user.id)
    }
  }