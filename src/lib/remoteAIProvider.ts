export interface HostedAIConfig {
  baseUrl: string;
  apiKey?: string;
  chatModel: string;
  embeddingModel?: string;
  headers?: Record<string, string>;
}

export interface HostedAIProvider {
  chat(prompt: string, system?: string, signal?: AbortSignal): Promise<string>;
  embed(input: string, signal?: AbortSignal): Promise<number[]>;
}

function endpoint(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function createOpenAICompatibleProvider(config: HostedAIConfig): HostedAIProvider {
  const headers = {
    'content-type': 'application/json',
    ...(config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : {}),
    ...(config.headers ?? {}),
  };

  return {
    async chat(prompt, system, signal) {
      const response = await fetch(endpoint(config.baseUrl, 'chat/completions'), {
        method: 'POST',
        headers,
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
      if (!response.ok) throw new Error(`Hosted AI chat failed: ${response.status}`);
      const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      return payload.choices?.[0]?.message?.content ?? '';
    },
    async embed(input, signal) {
      if (!config.embeddingModel) throw new Error('Embedding model is not configured');
      const response = await fetch(endpoint(config.baseUrl, 'embeddings'), {
        method: 'POST',
        headers,
        signal,
        body: JSON.stringify({ model: config.embeddingModel, input }),
      });
      if (!response.ok) throw new Error(`Hosted AI embedding failed: ${response.status}`);
      const payload = await response.json() as { data?: Array<{ embedding?: number[] }> };
      return payload.data?.[0]?.embedding ?? [];
    },
  };
}
