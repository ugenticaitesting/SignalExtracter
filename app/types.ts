export interface Signal {
  id: string;
  original_text: string;
  extracted_action_item: string | null;
  people_mentioned: string[] | null;
  urgency_score: number | null;
  timestamp: string;
}

export interface ExtractResponse {
  success: boolean;
  data?: Signal;
  error?: string;
}
