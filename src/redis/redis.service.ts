import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async acquireLock(key: string, ttl: number): Promise<boolean> {
    const result = await this.client.set(
      key,
      "locked",
      "EX",
      Math.ceil(ttl / 1000),
      "NX",
    );
    return result === "OK";
  }

  async releaseLock(key: string): Promise<void> {
    await this.client.del(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, "EX", Math.ceil(ttl / 1000));
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
