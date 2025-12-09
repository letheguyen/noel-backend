import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { SystemService } from "./system.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { IsEnum } from "class-validator";

class UpdateSystemStatusDto {
  @IsEnum(["on", "off"])
  status: "on" | "off";
}

@Controller("system")
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get("status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getSystemStatus() {
    const status = await this.systemService.getSystemStatus();
    return { status };
  }

  @Post("status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateSystemStatus(@Body() dto: UpdateSystemStatusDto) {
    await this.systemService.setSystemStatus(dto.status);
    return { status: dto.status, message: `System status updated to ${dto.status}` };
  }
}

