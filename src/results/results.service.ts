import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Result, ResultDocument, ResultStatus } from "./schemas/result.schema";
import { RedisService } from "../redis/redis.service";
import { MembersService } from "../members/members.service";
import { MemberStatus } from "../members/schemas/member.schema";

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    private redisService: RedisService,
    private membersService: MembersService,
  ) {}

  async getOpenResults(): Promise<ResultDocument[]> {
    return this.resultModel.find({ Status: ResultStatus.OPEN }).exec();
  }

  async findById(id: string): Promise<ResultDocument | null> {
    return this.resultModel.findById(id).exec();
  }

  async getRandomResult(): Promise<ResultDocument | null> {
    const results = await this.getOpenResults();
    if (results.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * results.length);
    return results[randomIndex];
  }

  async assignResult(
    resultId: string,
    ownerId: string,
  ): Promise<ResultDocument> {
    const result = await this.findById(resultId);
    if (!result) {
      throw new NotFoundException("Result not found");
    }

    if (result.Status !== ResultStatus.OPEN) {
      throw new Error("Result is not available");
    }

    result.Status = ResultStatus.HOLD;
    result.OwnerId = ownerId;
    return result.save();
  }

  async randomResultWithLock(
    memberId: string,
    chosenTaskType: number,
  ): Promise<ResultDocument> {
    // Check if member already has a result - prevent spinning again
    const member = await this.membersService.findById(memberId);
    if (!member) {
      throw new NotFoundException("Member not found");
    }

    if (member.ResultId) {
      throw new BadRequestException(
        "Bạn đã quay thưởng rồi. Không thể quay lại.",
      );
    }

    // Validate member status if chosenTaskType is 1 (take challenge)
    if (chosenTaskType === 1) {
      if (member.Status !== MemberStatus.DONE) {
        throw new BadRequestException(
          "Member must complete task first (Status must be DONE)",
        );
      }
    }

    const lockKey = "result:random";

    // Try to acquire lock
    const lockAcquired = await this.redisService.acquireLock(lockKey, 5000);
    if (!lockAcquired) {
      throw new Error("Could not acquire lock. Please try again.");
    }

    try {
      const result = await this.getRandomResult();
      if (!result) {
        throw new NotFoundException("No available results");
      }

      await this.assignResult(result._id.toString(), memberId);
      return result;
    } finally {
      await this.redisService.releaseLock(lockKey);
    }
  }
}
