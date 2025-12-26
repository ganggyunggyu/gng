import { Schema, model, models } from 'mongoose';
import type { MessageRole, Provider } from '@/types';

export interface IMessageMeta {
  provider?: Provider;
  model?: string;
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  error?: string;
}

export interface IMessage {
  _id: string;
  threadId: string;
  role: MessageRole;
  content: string;
  meta?: IMessageMeta;
  createdAt: Date;
}

const MessageMetaSchema = new Schema<IMessageMeta>(
  {
    provider: {
      type: String,
      enum: ['openai', 'anthropic', 'gemini', 'xai', 'deepseek', 'solar'],
    },
    model: { type: String },
    latencyMs: { type: Number },
    tokensIn: { type: Number },
    tokensOut: { type: Number },
    error: { type: String },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    _id: { type: String, required: true },
    threadId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: true,
    },
    content: { type: String, required: true },
    meta: { type: MessageMetaSchema },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

MessageSchema.index({ threadId: 1, createdAt: 1 });

export const Message = models.Message || model<IMessage>('Message', MessageSchema);
