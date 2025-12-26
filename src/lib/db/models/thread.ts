import { Schema, model, models } from 'mongoose';
import type { IModelConfig } from './project';

export interface IThreadSnapshot {
  promptVersionId?: string;
  modelConfig: IModelConfig;
  systemPrompt?: string;
}

export interface IThread {
  _id: string;
  projectId: string;
  title: string;
  snapshot?: IThreadSnapshot;
  createdAt: Date;
  updatedAt: Date;
}

const ThreadSnapshotSchema = new Schema<IThreadSnapshot>(
  {
    promptVersionId: { type: String },
    modelConfig: {
      provider: {
        type: String,
        enum: ['openai', 'anthropic', 'gemini', 'xai', 'deepseek', 'solar'],
      },
      modelName: { type: String },
      temperature: { type: Number },
      maxTokens: { type: Number },
    },
    systemPrompt: { type: String },
  },
  { _id: false }
);

const ThreadSchema = new Schema<IThread>(
  {
    _id: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
    title: { type: String, default: 'New Chat' },
    snapshot: { type: ThreadSnapshotSchema },
  },
  {
    timestamps: true,
  }
);

ThreadSchema.index({ projectId: 1, createdAt: -1 });

export const Thread = models.Thread || model<IThread>('Thread', ThreadSchema);
