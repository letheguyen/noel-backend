import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type MemberDocument = Member & Document;

export enum CardType {
  RED = "RED",
  BLUE = "BLUE",
  WHITE = "WHITE",
}

export enum MemberStatus {
  PENDING = "PENDING",
  CHOSEN = "CHOSEN",
  TODO = "TODO",
  DONE = "DONE",
}

export enum ChosenTaskType {
  TAKE_CHALLENGE = 1,
  CLAIM_REWARD = 2,
}

@Schema({ timestamps: true })
export class Member {
  @Prop({ required: true, unique: true, index: true })
  UUID: string;

  @Prop({ required: true })
  Name: string;

  @Prop({ type: Number, enum: ChosenTaskType })
  ChosenTaskType?: ChosenTaskType;

  @Prop({ type: String, enum: CardType })
  CardType?: CardType;

  @Prop({ type: String, enum: MemberStatus, default: MemberStatus.PENDING })
  Status: MemberStatus;

  @Prop()
  NumberItem?: string;

  @Prop({ default: false })
  IsAdmin: boolean;

  @Prop()
  TaskId?: string;

  @Prop()
  ResultId?: string;

  @Prop()
  activeSessionToken?: string;

  @Prop({ default: false })
  CardStatus: boolean;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
