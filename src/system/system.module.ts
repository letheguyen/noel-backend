import { Module } from "@nestjs/common";
import { SystemService } from "./system.service";
import { SystemController } from "./system.controller";
import { RedisModule } from "../redis/redis.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [RedisModule, AuthModule],
  providers: [SystemService],
  controllers: [SystemController],
  exports: [SystemService],
})
export class SystemModule {}

