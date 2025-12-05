import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Request,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TaskType } from "./schemas/task.schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { MembersService } from "../members/members.service";
import { CardType } from "../members/schemas/member.schema";
import { IsEnum } from "class-validator";

class RandomTaskDto {
  @IsEnum(CardType)
  CardType: CardType;
}

@Controller("tasks")
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly membersService: MembersService,
  ) {}

  @Get()
  async getOpenTasks() {
    const tasks = await this.tasksService.getOpenTasks();
    return tasks.map((task) => ({
      id: task._id,
      descriptions: task.descriptions,
      TaskType: task.TaskType,
      Status: task.Status,
    }));
  }

  @Get("all")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllTasks() {
    const tasks = await this.tasksService.getAllTasks();
    return tasks.map((task) => ({
      id: task._id,
      descriptions: task.descriptions,
      TaskType: task.TaskType,
      Status: task.Status,
    }));
  }

  @Get(":id")
  async getTaskDetails(@Param("id") id: string) {
    const task = await this.tasksService.findById(id);
    if (!task) {
      throw new Error("Task not found");
    }
    return {
      id: task._id,
      descriptions: task.descriptions,
      TaskType: task.TaskType,
      Status: task.Status,
    };
  }

  @Post("random")
  @UseGuards(JwtAuthGuard)
  async randomTask(@Body() dto: RandomTaskDto, @Request() req) {
    const memberId = req.user.memberId;
    const task = await this.tasksService.randomTaskWithLock(
      dto.CardType as unknown as TaskType,
    );

    // Assign task to member
    await this.membersService.assignTask(
      memberId,
      task._id.toString(),
      dto.CardType,
    );

    return {
      id: task._id,
      descriptions: task.descriptions,
      TaskType: task.TaskType,
      Status: task.Status,
    };
  }
}
