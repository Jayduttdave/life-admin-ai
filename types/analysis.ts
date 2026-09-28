export interface AnalysisResult {
  output?: AnalysisResult;
  document_type?: string;
  summary?: string;
  important_information?: (string | Record<string, unknown>)[];
  deadlines?: (string | Record<string, unknown>)[];
  required_documents?: (string | Record<string, unknown>)[];
  required_actions?: (string | Record<string, unknown>)[];
  next_step?: string;
  warnings?: (string | Record<string, unknown>)[];
}
