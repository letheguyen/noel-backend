import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { MembersModule } from "../members/members.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [MembersModule, AuthModule],
  controllers: [AdminController],
})
export class AdminModule {}
