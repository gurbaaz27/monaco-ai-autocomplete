export interface CompletionRequest {
  prefix: string;
  suffix: string;
  languageId: string;
  cursorOffset: number;
}

export interface CompletionResponse {
  text?: string;
  edits?: EditPlan;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cached?: boolean;
}

export interface EditPlan {
  edits: Array<{
    range: {
      startLine: number;
      startColumn: number;
      endLine: number;
      endColumn: number;
    };
    text: string;
  }>;
}

export interface MonacoAutocompleteConfig {
  debounceMs?: number;
  maxTokens?: number;
  temperature?: number;
}

export type LLMClient = (request: CompletionRequest) => Promise<CompletionResponse>;
