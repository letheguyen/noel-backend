import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ResultsController } from "./results.controller";
import { ResultsService } from "./results.service";
import { Result, ResultSchema } from "./schemas/result.schema";
import { RedisModule } from "../redis/redis.module";
import { MembersModule } from "../members/members.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }]),
    RedisModule,
    MembersModule,
  ],
  controllers: [ResultsController],
  providers: [ResultsService],
  exports: [ResultsService],
})
export class ResultsModule {}
