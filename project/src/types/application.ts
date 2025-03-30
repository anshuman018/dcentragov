export interface Application {
  id: string;
  user_id: string;
  service_id: string;
  documents: Record<string, string>;
  status: ApplicationStatus;
  ai_confidence: number;
  reason?: string;
  created_at: string;
}

export enum ApplicationStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING_HUMAN_REVIEW = 'PENDING_HUMAN_REVIEW'
}