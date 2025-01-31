import { Injectable, PipeTransform } from "@nestjs/common"

@Injectable()
export class InitDataPipe implements PipeTransform {
    transform(initData: string) {
        const query = new URLSearchParams(initData)
        const user = JSON.parse(query.get('user'))
        
        return String(user.id)
    }
  }