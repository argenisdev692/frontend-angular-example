import { CampaignExportListItemResponse } from '../../../api/models/campaign-export-list-item-response';
import { CampaignExportStatusResponse } from '../../../api/models/campaign-export-status-response';
import { GenerateTopicsBody } from '../../../api/models/generate-topics-body';
import { GenerateCampaignBody } from '../../../api/models/generate-campaign-body';
import { RequestCampaignExportBody } from '../../../api/models/request-campaign-export-body';

// ── Re-exported generated API models (compile-time types only) ──
export type {
  CampaignExportListItemResponse,
  CampaignExportStatusResponse,
  GenerateTopicsBody,
  GenerateCampaignBody,
  RequestCampaignExportBody,
};

/** A single stage-export row from the status response (ZIP download links). */
export type CampaignStageExport = CampaignExportStatusResponse['stageExports'][number];

/** Possible job status for a campaign generation. */
export type CampaignStatus = CampaignExportListItemResponse['status'];

// ── Step-1 (generate-topics) response ─────────────────────────────
// The generated client discards this body (`responseType: 'text'`), so the
// feature service re-fetches it via HttpClient with this hand-typed shape,
// mirroring the Step-1 `output_format` contract in
// docs/CAMPAIGNS/prompt-campaigns-generator-v2.md.

export interface GeographicContext {
  city: string;
  state: string;
  country: string;
  market_size: 'small' | 'medium' | 'large';
  competition_level: 'low' | 'medium' | 'high';
  seasonality_factors: string[];
  local_trends: string[];
}

export interface LocalMarketAnalysis {
  target_audience: string;
  audience_demographics: string;
  key_pain_points: string[];
  content_preferences: string[];
  trending_topics: string[];
  tavily_insights: string[];
  geographic_context: GeographicContext;
}

export interface CampaignTopic {
  /** Backend may return a numeric index or a persisted id; sent as `topicId` (string) in Step 2. */
  id: string | number;
  title: string;
  angle: string;
  hook: string;
  format: '9:16' | '16:9' | 'both';
  stage?: FunnelStage;
  estimated_virality: number;
  estimated_engagement: 'high' | 'medium' | 'low';
  estimated_roi: number;
  difficulty: 'easy' | 'medium' | 'hard';
  local_market_fit: number;
  why_it_works: string;
  key_trend: string;
  suggested_format: 'video' | 'reel' | 'short' | 'story';
  content_type: 'educational' | 'entertainment' | 'inspirational' | 'promotional' | 'news';
  geographic_relevance: string;
}

export interface GenerateTopicsResponse {
  local_market_analysis: LocalMarketAnalysis;
  campaign_topics: CampaignTopic[];
}

// ── UI configuration (kept here so components stay declarative) ────
export type VideoFormat = '9:16' | '16:9' | 'both';
export type FunnelStage = 'TOFU' | 'MOFU' | 'BOFU' | 'LOYALTY';
export type CampaignAiProvider = NonNullable<GenerateCampaignBody['aiProvider']>;
export type VideoDuration = 15 | 20;

export interface FormatConfig {
  id: VideoFormat;
  label: string;
  icon: string;
  dims: string;
}

export const VIDEO_FORMATS: readonly FormatConfig[] = [
  { id: '9:16', label: '9:16 Vertical', icon: '📱', dims: '1080×1920' },
  { id: '16:9', label: '16:9 Horizontal', icon: '📺', dims: '1920×1080' },
  { id: 'both', label: 'Both', icon: '🔄', dims: '9:16 + 16:9' },
] as const;

export interface StageConfig {
  id: FunnelStage;
  label: string;
  icon: string;
  description: string;
  /** styles.css token-backed CSS class for the stage badge. */
  tone: 'stage-tofu' | 'stage-mofu' | 'stage-bofu' | 'stage-loyalty';
}

export const FUNNEL_STAGES: readonly StageConfig[] = [
  { id: 'TOFU', label: 'TOFU · Awareness', icon: '🔵', description: 'Educational, empathetic, no sales pressure', tone: 'stage-tofu' },
  { id: 'MOFU', label: 'MOFU · Consideration', icon: '🟢', description: 'Informative, professional, builds trust', tone: 'stage-mofu' },
  { id: 'BOFU', label: 'BOFU · Decision', icon: '🟠', description: 'Urgent, direct, immediate action', tone: 'stage-bofu' },
  { id: 'LOYALTY', label: 'LOYALTY · Retention', icon: '🟣', description: 'Warm, grateful, community-driven', tone: 'stage-loyalty' },
] as const;

export interface ProviderConfig {
  id: CampaignAiProvider;
  label: string;
  icon: string;
}

export const AI_PROVIDERS: readonly ProviderConfig[] = [
  { id: 'gemini', label: 'Gemini', icon: '✨' },
  { id: 'claude', label: 'Claude', icon: '🤖' },
  { id: 'openai', label: 'OpenAI', icon: '🧠' },
];

export const DURATIONS: readonly VideoDuration[] = [15, 20];

export const LANGUAGES: readonly { id: string; label: string }[] = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'English' },
];

/** The five threshold-gated quality scores from the Step-2 spec. */
export type CampaignScoreKey =
  | 'local_market_fit'
  | 'virality_probability'
  | 'roi_potential'
  | 'audience_alignment'
  | 'trend_relevance';

export interface ScoreConfig {
  key: CampaignScoreKey;
  icon: string;
  label: string;
  threshold: number;
  critical: boolean;
}

export const SCORE_CONFIG: readonly ScoreConfig[] = [
  { key: 'local_market_fit', icon: '🏙️', label: 'Local Market Fit', threshold: 75, critical: true },
  { key: 'virality_probability', icon: '🔥', label: 'Virality', threshold: 70, critical: false },
  { key: 'roi_potential', icon: '💰', label: 'ROI', threshold: 70, critical: false },
  { key: 'audience_alignment', icon: '👥', label: 'Audience', threshold: 70, critical: false },
  { key: 'trend_relevance', icon: '📈', label: 'Trend', threshold: 70, critical: false },
];

/** Maps a 0-100 score to a token-backed CSS class (no hex in templates). */
export function scoreToneClass(value: number): 'score-good' | 'score-warn' | 'score-bad' {
  if (value >= 75) return 'score-good';
  if (value >= 50) return 'score-warn';
  return 'score-bad';
}

/** Maps a job status to a token-backed status-badge CSS class. */
export function statusToneClass(status: CampaignStatus): string {
  return `status-${status}`;
}
