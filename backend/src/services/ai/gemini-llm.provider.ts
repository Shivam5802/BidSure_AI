import {
  LLMProvider,
  RequirementExtractionContext,
  ExtractionResult,
  ExtractionResultSchema,
} from './llm-provider.interface.js';
import { REQUIREMENT_EXTRACTION_SYSTEM_PROMPT, buildExtractionUserPrompt } from './prompts.js';
import { env } from '../../config/env.js';

export class GeminiLLMProvider implements LLMProvider {
  name = 'gemini';

  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey?: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey || env.LLM_API_KEY || '';
    this.model = model || env.LLM_MODEL || 'gemini-2.5-flash';
    this.baseUrl = baseUrl || env.LLM_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
  }

  async extractRequirements(
    context: RequirementExtractionContext
  ): Promise<ExtractionResult> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured (LLM_API_KEY).');
    }

    const userPrompt = buildExtractionUserPrompt(context);
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: REQUIREMENT_EXTRACTION_SYSTEM_PROMPT }],
      },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API call failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as any;
    const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('Empty or invalid response received from Gemini API.');
    }

    try {
      const jsonParsed = JSON.parse(textContent);
      return ExtractionResultSchema.parse(jsonParsed);
    } catch (err: any) {
      throw new Error(`Failed to parse structured Gemini output: ${err.message}`);
    }
  }
}
