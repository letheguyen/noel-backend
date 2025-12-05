import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MembersService } from "../members/members.service";
import { MemberDocument } from "../members/schemas/member.schema";

@Injectable()
export class AuthService {
  constructor(
    private membersService: MembersService,
    private jwtService: JwtService,
  ) {}

  async login(uuid: string): Promise<{ access_token: string; member: any }> {
    // Check if user already has active session
    const hasActiveSession = await this.membersService.checkActiveSession(uuid);
    if (hasActiveSession) {
      throw new ConflictException(
        "User is already logged in on another device",
      );
    }

    // Find or create member
    let member = await this.membersService.findByUUID(uuid);
    if (!member) {
      throw new NotFoundException("Member not found");
    }

    // Generate JWT token
    const payload = {
      uuid: member.UUID,
      memberId: member._id.toString(),
    };

    const access_token = this.jwtService.sign(payload);

    // Update active session
    await this.membersService.updateActiveSession(uuid, access_token);

    return {
      access_token,
      member: {
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
      },
    };
  }

  async validateUser(payload: any): Promise<MemberDocument> {
    const member = await this.membersService.findById(payload.memberId);
    if (!member) {
      throw new UnauthorizedException();
    }
    return member;
  }

  async logout(uuid: string): Promise<void> {
    await this.membersService.updateActiveSession(uuid, null);
  }
}
