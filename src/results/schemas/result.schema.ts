import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ResultDocument = Result & Document;

export enum ResultStatus {
  OPEN = "OPEN",
  HOLD = "HOLD",
}

@Schema({ timestamps: true })
export class Result {
  @Prop({ required: true })
  ResultNumber: string;

  @Prop({ type: String, enum: ResultStatus, default: ResultStatus.OPEN })
  Status: ResultStatus;

  @Prop()
  OwnerId?: string;
}

export const ResultSchema = SchemaFactory.createForClass(Result);
