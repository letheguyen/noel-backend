import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from "@nestjs/common";
import { SystemService } from "./system.service";

@Injectable()
export class SystemStatusGuard implements CanActivate {
  constructor(private systemService: SystemService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isOn = await this.systemService.isSystemOn();
    if (!isOn) {
      throw new ServiceUnavailableException(
        "System is currently offline. Please wait for admin to start the system.",
      );
    }
    return true;
  }
}

