import { Schema, model, models } from 'mongoose';
import type { InternalMessage, TestAssertion, IModelConfig } from '@/types';

export interface ITestCase {
  _id: string;
  projectId: string;
  name: string;
  description?: string;
  inputMessages: InternalMessage[];
  assertions: TestAssertion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITestRun {
  _id: string;
  testCaseId: string;
  promptVersionId: string;
  modelConfig: IModelConfig;
  passed: boolean;
  output: string;
  failedAssertions?: string[];
  latencyMs?: number;
  createdAt: Date;
}

const InternalMessageSchema = new Schema(
  {
    role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { _id: false }
);

const TestAssertionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['forbidden_words', 'must_include', 'json_schema', 'max_length'],
      required: true,
    },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const TestCaseSchema = new Schema<ITestCase>(
  {
    _id: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    inputMessages: { type: [InternalMessageSchema], required: true },
    assertions: { type: [TestAssertionSchema], required: true },
  },
  {
    timestamps: true,
  }
);

const TestRunSchema = new Schema<ITestRun>(
  {
    _id: { type: String, required: true },
    testCaseId: { type: String, required: true, index: true },
    promptVersionId: { type: String, required: true },
    modelConfig: {
      provider: { type: String, required: true },
      modelName: { type: String, required: true },
      temperature: { type: Number },
      maxTokens: { type: Number },
    },
    passed: { type: Boolean, required: true },
    output: { type: String, required: true },
    failedAssertions: { type: [String] },
    latencyMs: { type: Number },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

TestRunSchema.index({ testCaseId: 1, createdAt: -1 });
TestRunSchema.index({ promptVersionId: 1 });

export const TestCase = models.TestCase || model<ITestCase>('TestCase', TestCaseSchema);
export const TestRun = models.TestRun || model<ITestRun>('TestRun', TestRunSchema);
