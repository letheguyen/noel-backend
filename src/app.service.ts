import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "🎄 Noel Backend API is running!";
  }
}
