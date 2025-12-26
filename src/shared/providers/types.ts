import type { InternalMessage, InternalStreamEvent, ModelConfig } from '@/shared/types';

export interface ProviderAdapter {
  name: string;
  chat(params: ChatParams): Promise<ReadableStream<Uint8Array>>;
}

export interface ChatParams {
  messages: InternalMessage[];
  modelConfig: ModelConfig;
  systemPrompt?: string;
  signal?: AbortSignal;
}

export interface StreamChunk {
  type: 'delta' | 'done' | 'error';
  content?: string;
  error?: string;
}

export function encodeSSE(event: InternalStreamEvent): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

export function createSSEStream(
  generator: AsyncGenerator<InternalStreamEvent>,
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await generator.next();
      if (done) {
        controller.close();
        return;
      }
      controller.enqueue(encodeSSE(value));
    },
  });
}
