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
import { IsString, IsNotEmpty, IsEnum, IsBoolean } from "class-validator";
import { MemberStatus } from "./schemas/member.schema";

class UpdateMemberStatusDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsEnum(MemberStatus)
  status: MemberStatus;
}

class UpdateCardStatusDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsBoolean()
  cardStatus: boolean;
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
      CardStatus: member.CardStatus,
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
      CardStatus: member.CardStatus,
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
      CardStatus: member.CardStatus,
    };
  }

  @Post("update-card-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateCardStatus(@Body() dto: UpdateCardStatusDto) {
    const member = await this.membersService.findById(dto.memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    // Only allow update if member has received reward (has ResultId)
    if (!member.ResultId) {
      throw new Error("Cannot update card status: Member has not received reward yet");
    }

    const updatedMember = await this.membersService.updateCardStatus(
      dto.memberId,
      dto.cardStatus,
    );
    return {
      id: updatedMember._id,
      UUID: updatedMember.UUID,
      Name: updatedMember.Name,
      ChosenTaskType: updatedMember.ChosenTaskType,
      CardType: updatedMember.CardType,
      Status: updatedMember.Status,
      NumberItem: updatedMember.NumberItem,
      IsAdmin: updatedMember.IsAdmin,
      TaskId: updatedMember.TaskId,
      ResultId: updatedMember.ResultId,
      CardStatus: updatedMember.CardStatus,
    };
  }
}
