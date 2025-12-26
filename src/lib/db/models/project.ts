import { Schema, model, models } from 'mongoose';
import type { Provider } from '@/types';

export interface IModelConfig {
  provider: Provider;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IPromptLayers {
  systemBase: string;
  persona?: string;
  constraints?: string;
  toolsPolicy?: string;
}

export interface IProject {
  _id: string;
  name: string;
  description?: string;
  modelConfig: IModelConfig;
  promptLayers: IPromptLayers;
  currentPromptVersionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ModelConfigSchema = new Schema<IModelConfig>(
  {
    provider: {
      type: String,
      enum: ['openai', 'anthropic', 'gemini', 'xai', 'deepseek', 'solar'],
      required: true,
    },
    modelName: { type: String, required: true },
    temperature: { type: Number, default: 0.7 },
    maxTokens: { type: Number, default: 4096 },
  },
  { _id: false }
);

const PromptLayersSchema = new Schema<IPromptLayers>(
  {
    systemBase: { type: String, default: '' },
    persona: { type: String },
    constraints: { type: String },
    toolsPolicy: { type: String },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    modelConfig: { type: ModelConfigSchema, required: true },
    promptLayers: { type: PromptLayersSchema, default: () => ({ systemBase: '' }) },
    currentPromptVersionId: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Project = models.Project || model<IProject>('Project', ProjectSchema);
