import { LLMProvider } from './llm-provider.interface.js';
import { GeminiLLMProvider } from './gemini-llm.provider.js';
import { OpenAILLMProvider } from './openai-llm.provider.js';
import { MockLLMProvider } from './mock-llm.provider.js';
import { env } from '../../config/env.js';

export class LLMFactory {
  static getProvider(overrideProvider?: string): LLMProvider {
    const providerType = overrideProvider || env.LLM_PROVIDER;

    switch (providerType.toLowerCase()) {
      case 'gemini':
        if (!env.LLM_API_KEY) {
          console.warn('LLM_PROVIDER is set to "gemini" but LLM_API_KEY is missing. Falling back to MockLLMProvider.');
          return new MockLLMProvider();
        }
        return new GeminiLLMProvider();
      case 'openai':
        if (!env.LLM_API_KEY) {
          console.warn('LLM_PROVIDER is set to "openai" but LLM_API_KEY is missing. Falling back to MockLLMProvider.');
          return new MockLLMProvider();
        }
        return new OpenAILLMProvider();
      case 'mock':
      default:
        return new MockLLMProvider();
    }
  }
}
