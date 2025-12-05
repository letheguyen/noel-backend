import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { MembersService } from "../members/members.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private membersService: MembersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const memberId = request.user.memberId;

    const member = await this.membersService.findById(memberId);
    if (!member || !member.IsAdmin) {
      throw new ForbiddenException("Admin access required");
    }

    return true;
  }
}
