export interface LocalAIConfig {
  baseUrl: string;
  chatModel: string;
  embeddingModel?: string;
}

export interface LocalAIProvider {
  chat(prompt: string, system?: string, signal?: AbortSignal): Promise<string>;
  embed(input: string, signal?: AbortSignal): Promise<number[]>;
}

function apiUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, '')}/api/${path}`;
}

export function createOllamaProvider(config: LocalAIConfig): LocalAIProvider {
  return {
    async chat(prompt, system, signal) {
      const response = await fetch(apiUrl(config.baseUrl, 'chat'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal,
        body: JSON.stringify({
          model: config.chatModel,
          stream: false,
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!response.ok) throw new Error(`Ollama chat failed: ${response.status}`);
      const payload = await response.json() as { message?: { content?: string } };
      return payload.message?.content ?? '';
    },
    async embed(input, signal) {
      if (!config.embeddingModel) throw new Error('Embedding model is not configured');
      const response = await fetch(apiUrl(config.baseUrl, 'embed'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal,
        body: JSON.stringify({ model: config.embeddingModel, input }),
      });
      if (!response.ok) throw new Error(`Ollama embedding failed: ${response.status}`);
      const payload = await response.json() as { embeddings?: number[][] };
      return payload.embeddings?.[0] ?? [];
    },
  };
}
