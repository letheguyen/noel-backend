import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Task,
  TaskDocument,
  TaskStatus,
  TaskType,
} from "./schemas/task.schema";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private redisService: RedisService,
  ) {}

  async getOpenTasks(): Promise<TaskDocument[]> {
    return this.taskModel.find({ Status: TaskStatus.OPEN }).exec();
  }

  async getAllTasks(): Promise<TaskDocument[]> {
    return this.taskModel.find().exec();
  }

  async getOpenTasksByType(taskType: TaskType): Promise<TaskDocument[]> {
    return this.taskModel
      .find({
        Status: TaskStatus.OPEN,
        TaskType: taskType,
      })
      .exec();
  }

  async findById(id: string): Promise<TaskDocument | null> {
    return this.taskModel.findById(id).exec();
  }

  async getRandomTaskByType(taskType: TaskType): Promise<TaskDocument | null> {
    const tasks = await this.getOpenTasksByType(taskType);
    if (tasks.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * tasks.length);
    return tasks[randomIndex];
  }

  async assignTask(taskId: string): Promise<TaskDocument> {
    const task = await this.findById(taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    if (task.Status !== TaskStatus.OPEN) {
      throw new Error("Task is not available");
    }

    task.Status = TaskStatus.HOLD;
    return task.save();
  }

  async markTaskCompleted(taskId: string): Promise<TaskDocument> {
    const task = await this.findById(taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    task.Status = TaskStatus.CLOSE;
    return task.save();
  }

  async randomTaskWithLock(cardType: TaskType): Promise<TaskDocument> {
    const lockKey = `task:random:${cardType}`;

    // Try to acquire lock
    const lockAcquired = await this.redisService.acquireLock(lockKey, 5000);
    if (!lockAcquired) {
      throw new Error("Could not acquire lock. Please try again.");
    }

    try {
      const task = await this.getRandomTaskByType(cardType);
      if (!task) {
        throw new NotFoundException(`No available tasks of type ${cardType}`);
      }

      await this.assignTask(task._id.toString());
      return task;
    } finally {
      await this.redisService.releaseLock(lockKey);
    }
  }
}
