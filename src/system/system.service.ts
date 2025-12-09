import { Injectable, OnModuleInit } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

const SYSTEM_STATUS_KEY = "system:status";

@Injectable()
export class SystemService implements OnModuleInit {
  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    // Initialize system status to "off" if not exists
    const currentStatus = await this.redisService.get(SYSTEM_STATUS_KEY);
    if (!currentStatus) {
      await this.redisService.set(SYSTEM_STATUS_KEY, "off");
    }
  }

  async getSystemStatus(): Promise<"on" | "off"> {
    const status = await this.redisService.get(SYSTEM_STATUS_KEY);
    return (status === "on" ? "on" : "off") as "on" | "off";
  }

  async setSystemStatus(status: "on" | "off"): Promise<void> {
    await this.redisService.set(SYSTEM_STATUS_KEY, status);
  }

  async isSystemOn(): Promise<boolean> {
    const status = await this.getSystemStatus();
    return status === "on";
  }
}

