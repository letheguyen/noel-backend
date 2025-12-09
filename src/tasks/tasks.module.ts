import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { Task, TaskSchema } from "./schemas/task.schema";
import { RedisModule } from "../redis/redis.module";
import { MembersModule } from "../members/members.module";
import { SystemModule } from "../system/system.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    RedisModule,
    MembersModule,
    SystemModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
