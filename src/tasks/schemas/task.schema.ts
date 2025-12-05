import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TaskDocument = Task & Document;

export enum TaskType {
  RED = "RED",
  BLUE = "BLUE",
  WHITE = "WHITE",
}

export enum TaskStatus {
  OPEN = "OPEN",
  HOLD = "HOLD",
  CLOSE = "CLOSE",
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  descriptions: string;

  @Prop({ type: String, enum: TaskType, required: true })
  TaskType: TaskType;

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.OPEN })
  Status: TaskStatus;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
