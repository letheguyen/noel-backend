import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Request,
} from "@nestjs/common";
import { ResultsService } from "./results.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { IsNumber, Min, Max } from "class-validator";
import { MembersService } from "../members/members.service";

class RandomResultDto {
  @IsNumber()
  @Min(1)
  @Max(2)
  ChosenTaskType: number;
}

@Controller("results")
export class ResultsController {
  constructor(
    private readonly resultsService: ResultsService,
    private readonly membersService: MembersService,
  ) {}

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getResultDetails(@Param("id") id: string) {
    const result = await this.resultsService.findById(id);
    if (!result) {
      throw new Error("Result not found");
    }
    return {
      id: result._id,
      ResultNumber: result.ResultNumber,
      Status: result.Status,
      OwnerId: result.OwnerId,
    };
  }

  @Post("random")
  @UseGuards(JwtAuthGuard)
  async randomResult(@Body() dto: RandomResultDto, @Request() req) {
    const memberId = req.user.memberId;
    const result = await this.resultsService.randomResultWithLock(
      memberId,
      dto.ChosenTaskType,
    );

    // Update member with result ID
    await this.membersService.assignResult(memberId, result._id.toString());

    return {
      id: result._id,
      ResultNumber: result.ResultNumber,
      Status: result.Status,
    };
  }
}
