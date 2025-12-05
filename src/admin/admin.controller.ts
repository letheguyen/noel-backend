import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { MembersService } from "../members/members.service";
import { IsString, IsNotEmpty } from "class-validator";

class MarkTaskCompletedDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;
}

@Controller("admin")
export class AdminController {
  constructor(private readonly membersService: MembersService) {}

  @Post("mark-task-completed")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async markTaskCompleted(@Body() dto: MarkTaskCompletedDto) {
    const member = await this.membersService.markTaskCompleted(dto.memberId);
    return {
      id: member._id,
      UUID: member.UUID,
      Name: member.Name,
      Status: member.Status,
    };
  }
}
