import { Schema, model, models } from 'mongoose';
import type { IPromptLayers } from './project';

export interface IPromptVersion {
  _id: string;
  projectId: string;
  version: number;
  layers: IPromptLayers;
  changelog?: string;
  createdAt: Date;
}

const PromptLayersSchema = new Schema<IPromptLayers>(
  {
    systemBase: { type: String, required: true },
    persona: { type: String },
    constraints: { type: String },
    toolsPolicy: { type: String },
  },
  { _id: false }
);

const PromptVersionSchema = new Schema<IPromptVersion>(
  {
    _id: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    layers: { type: PromptLayersSchema, required: true },
    changelog: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

PromptVersionSchema.index({ projectId: 1, version: -1 });

export const PromptVersion =
  models.PromptVersion || model<IPromptVersion>('PromptVersion', PromptVersionSchema);
