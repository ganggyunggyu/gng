// Provider 타입
export type Provider = 'openai' | 'anthropic' | 'gemini' | 'xai' | 'deepseek' | 'solar';

export interface ModelConfig {
  provider: Provider;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}

// MongoDB 모델에서 사용
export type { ModelConfig as IModelConfig };

// 프롬프트 레이어
export interface PromptLayers {
  systemBase: string;
  persona?: string;
  constraints?: string;
  toolsPolicy?: string;
}

// 프롬프트 버전
export interface PromptVersion {
  id: string;
  projectId: string;
  version: number;
  layers: PromptLayers;
  createdAt: Date;
}

// 프로젝트
export interface Project {
  id: string;
  name: string;
  currentPromptVersionId: string | null;
  modelConfig: ModelConfig;
  createdAt: Date;
  updatedAt: Date;
}

// 스레드 스냅샷
export interface ThreadSnapshot {
  promptVersionId: string;
  modelConfig: ModelConfig;
}

// 스레드
export interface Thread {
  id: string;
  projectId: string;
  title: string;
  snapshot: ThreadSnapshot | null;
  createdAt: Date;
  updatedAt: Date;
}

// 메시지 메타
export interface MessageMeta {
  provider?: Provider;
  model?: string;
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  error?: string;
}

// 메시지 역할
export type MessageRole = 'system' | 'user' | 'assistant';

// 메시지
export interface Message {
  id: string;
  threadId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  meta?: MessageMeta;
}

// 내부 표준 메시지 (API 통신용)
export interface InternalMessage {
  role: MessageRole;
  content: string;
}

// 스트림 이벤트 타입
export type StreamEventType = 'delta' | 'done' | 'error';

// 내부 스트림 이벤트
export interface InternalStreamEvent {
  type: StreamEventType;
  data: string | { error: string };
}

// Eval 관련 타입
export interface TestAssertion {
  type: 'forbidden_words' | 'must_include' | 'json_schema' | 'max_length';
  value: string | string[] | number | object;
}

export interface TestCase {
  id: string;
  projectId: string;
  name: string;
  inputMessages: InternalMessage[];
  assertions: TestAssertion[];
  createdAt: Date;
}

export interface TestRun {
  id: string;
  testCaseId: string;
  promptVersionId: string;
  modelConfig: ModelConfig;
  passed: boolean;
  output: string;
  createdAt: Date;
}

// ID 생성 유틸
export const createId = {
  project: () => `prj_gng_${crypto.randomUUID()}`,
  thread: () => `th_gng_${crypto.randomUUID()}`,
  message: () => `msg_gng_${crypto.randomUUID()}`,
  promptVersion: () => `pv_gng_${crypto.randomUUID()}`,
  testCase: () => `tc_gng_${crypto.randomUUID()}`,
  testRun: () => `tr_gng_${crypto.randomUUID()}`,
};
