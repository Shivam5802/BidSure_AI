import {
  LLMProvider,
  RequirementExtractionContext,
  ExtractionResult,
  ExtractionResultSchema,
} from './llm-provider.interface.js';
import { REQUIREMENT_EXTRACTION_SYSTEM_PROMPT, buildExtractionUserPrompt } from './prompts.js';
import { env } from '../../config/env.js';

export class OpenAILLMProvider implements LLMProvider {
  name = 'openai';

  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey?: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey || env.LLM_API_KEY || '';
    this.model = model || env.LLM_MODEL || 'gpt-4o-mini';
    this.baseUrl = baseUrl || env.LLM_BASE_URL || 'https://api.openai.com/v1';
  }

  async extractRequirements(
    context: RequirementExtractionContext
  ): Promise<ExtractionResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured (LLM_API_KEY).');
    }

    const userPrompt = buildExtractionUserPrompt(context);
    const url = `${this.baseUrl}/chat/completions`;

    const requestBody = {
      model: this.model,
      messages: [
        { role: 'system', content: REQUIREMENT_EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API call failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as any;
    const textContent = data?.choices?.[0]?.message?.content;

    if (!textContent) {
      throw new Error('Empty or invalid response received from OpenAI API.');
    }

    try {
      const jsonParsed = JSON.parse(textContent);
      return ExtractionResultSchema.parse(jsonParsed);
    } catch (err: any) {
      throw new Error(`Failed to parse structured OpenAI output: ${err.message}`);
    }
  }
}
