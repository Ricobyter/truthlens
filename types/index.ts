export type Verdict =
  | "TRUE"
  | "FALSE"
  | "MISLEADING"
  | "PARTIALLY TRUE"
  | "NOT ENOUGH EVIDENCE";

export type PoliticalLean =
  | "LEFT"
  | "CENTER-LEFT"
  | "CENTER"
  | "CENTER-RIGHT"
  | "RIGHT"
  | "MIXED"
  | "NON-POLITICAL";

export interface Source {
  title: string;
  url: string;
  snippet?: string;
  publishedDate?: string;
}

export interface BiasAnalysis {
  politicalLean: PoliticalLean;
  emotionalLanguage: number;     // 0-100
  sourceCredibility: number;     // 0-100
  biasIndicators: string[];
}

export interface FactCheckResult {
  verdict: Verdict;
  confidence: number;
  summary: string;
  reasoning: string[];
  sources: Source[];
  bias: BiasAnalysis;
  isRealTime: boolean;           // true if time-sensitive news search was used
}

export interface FactCheckRecord {
  _id?: string;
  claim: string;
  verdict: Verdict;
  confidence: number;
  summary: string;
  reasoning: string[];
  sources: Source[];
  bias?: BiasAnalysis;
  isRealTime?: boolean;
  createdAt: Date | string;
}

export interface FactCheckRequest {
  input: string;
  type: "claim" | "article" | "tweet" | "transcript";
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
