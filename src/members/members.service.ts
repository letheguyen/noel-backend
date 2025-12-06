import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Member,
  MemberDocument,
  MemberStatus,
  CardType,
  ChosenTaskType,
} from "./schemas/member.schema";

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
  ) {}

  async findByUUID(uuid: string): Promise<MemberDocument | null> {
    return this.memberModel.findOne({ UUID: uuid }).exec();
  }

  async findById(id: string): Promise<MemberDocument | null> {
    return this.memberModel.findById(id).exec();
  }

  async create(uuid: string, name: string, IsAdmin = false): Promise<MemberDocument> {
    const existingMember = await this.findByUUID(uuid);
    if (existingMember) {
      throw new ConflictException("Member with this UUID already exists");
    }

    const member = new this.memberModel({
      UUID: uuid,
      Name: name,
      Status: MemberStatus.PENDING,
      IsAdmin,
    });

    return member.save();
  }

  async updateActiveSession(uuid: string, token: string | null): Promise<void> {
    await this.memberModel
      .updateOne({ UUID: uuid }, { activeSessionToken: token })
      .exec();
  }

  async checkActiveSession(uuid: string): Promise<boolean> {
    return null;
  }

  async assignTask(
    memberId: string,
    taskId: string,
    cardType: CardType,
  ): Promise<MemberDocument> {
    const member = await this.findById(memberId);
    if (!member) {
      throw new NotFoundException("Member not found");
    }

    member.TaskId = taskId;
    member.CardType = cardType;
    member.ChosenTaskType = ChosenTaskType.TAKE_CHALLENGE;
    member.Status = MemberStatus.TODO;

    return member.save();
  }

  async assignResult(
    memberId: string,
    resultId: string,
  ): Promise<MemberDocument> {
    const member = await this.findById(memberId);
    if (!member) {
      throw new NotFoundException("Member not found");
    }

    member.ResultId = resultId;
    return member.save();
  }

  async markTaskCompleted(memberId: string): Promise<MemberDocument> {
    const member = await this.findById(memberId);
    if (!member) {
      throw new NotFoundException("Member not found");
    }

    member.Status = MemberStatus.DONE;
    return member.save();
  }

  async updateChosenTaskType(
    memberId: string,
    chosenTaskType: ChosenTaskType,
  ): Promise<MemberDocument> {
    const member = await this.findById(memberId);
    if (!member) {
      throw new NotFoundException("Member not found");
    }

    member.ChosenTaskType = chosenTaskType;
    member.Status = MemberStatus.CHOSEN;
    return member.save();
  }

  async getAllMembers(): Promise<MemberDocument[]> {
    return this.memberModel.find({ IsAdmin: false }).exec();
  } 

  async updateStatus(
    memberId: string,
    status: MemberStatus,
  ): Promise<MemberDocument> {
    const member = await this.findById(memberId);
    if (!member) {
      throw new NotFoundException("Member not found");
    }

    member.Status = status;
    return member.save();
  }
}
