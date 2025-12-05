import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { MembersService } from "./members.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import { MemberStatus } from "./schemas/member.schema";

class UpdateMemberStatusDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsEnum(MemberStatus)
  status: MemberStatus;
}

@Controller("members")
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMemberInfo(@Request() req) {
    const member = await this.membersService.findById(req.user.memberId);
    if (!member) {
      throw new Error("Member not found");
    }
    return {
      id: member._id,
      UUID: member.UUID,
      Name: member.Name,
      ChosenTaskType: member.ChosenTaskType,
      CardType: member.CardType,
      Status: member.Status,
      NumberItem: member.NumberItem,
      IsAdmin: member.IsAdmin,
      TaskId: member.TaskId,
      ResultId: member.ResultId,
    };
  }

  @Get("all")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllMembers() {
    const members = await this.membersService.getAllMembers();
    return members.map((member) => ({
      id: member._id,
      UUID: member.UUID,
      Name: member.Name,
      ChosenTaskType: member.ChosenTaskType,
      CardType: member.CardType,
      Status: member.Status,
      NumberItem: member.NumberItem,
      IsAdmin: member.IsAdmin,
      TaskId: member.TaskId,
      ResultId: member.ResultId,
    }));
  }

  @Post("update-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateMemberStatus(@Body() dto: UpdateMemberStatusDto) {
    const member = await this.membersService.updateStatus(
      dto.memberId,
      dto.status,
    );
    return {
      id: member._id,
      UUID: member.UUID,
      Name: member.Name,
      ChosenTaskType: member.ChosenTaskType,
      CardType: member.CardType,
      Status: member.Status,
      NumberItem: member.NumberItem,
      IsAdmin: member.IsAdmin,
      TaskId: member.TaskId,
      ResultId: member.ResultId,
    };
  }
}
