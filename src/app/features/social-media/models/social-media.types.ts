import { PaginatedSocialMediaResponse } from '../../../api/models/paginated-social-media-response';
import { SocialMediaGenerationResponse } from '../../../api/models/social-media-generation-response';
import { SocialMediaTopicResponse } from '../../../api/models/social-media-topic-response';
import { GeneratePostJobResultDto } from '../../../api/models/generate-post-job-result-dto';

// ── Re-exported generated API models ──
export type {
  PaginatedSocialMediaResponse,
  SocialMediaGenerationResponse,
  SocialMediaTopicResponse,
  GeneratePostJobResultDto,
};

/** A single item from the paginated history list. */
export type SocialMediaItem = PaginatedSocialMediaResponse['data'][number];

/** A single generated post for a specific platform. */
export type GeneratedPost = SocialMediaItem['generatedPosts'][string];

// ── Generator request bodies ──
export interface FindTopicsRequest {
  niche: string;
  language?: string;
  maxTopics?: number;
}

export interface GenerateContentRequest {
  topic: { title: string; description: string };
  networks: {
    facebook?: boolean;
    instagram?: boolean;
    tiktok?: boolean;
    linkedin?: boolean;
    twitter?: boolean;
  };
  language?: string;
  saveToHistory?: boolean;
  topicId?: string;
}

// ── UI configuration ──
export type SocialMediaPlatformId = 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'tiktok';

export interface PlatformConfig {
  id: SocialMediaPlatformId;
  label: string;
  icon: string;
  color: string;
  dims: string;
}

export const PLATFORMS: readonly PlatformConfig[] = [
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'var(--brand-linkedin)', dims: '1200×627' },
  { id: 'twitter', label: 'Twitter/X', icon: '𝕏', color: 'var(--brand-twitter)', dims: '1200×675' },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: 'var(--brand-instagram)', dims: '1080×1080' },
  { id: 'facebook', label: 'Facebook', icon: '👥', color: 'var(--brand-facebook)', dims: '1200×630' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'var(--brand-tiktok)', dims: '1080×1920' },
] as const;

/** The five quality scores for social media content. */
export type MainScoreKey =
  | 'human_writing_index'
  | 'virality_score'
  | 'engagement_score'
  | 'roi_score'
  | 'trend_alignment';

export interface ScoreConfig {
  key: MainScoreKey;
  icon: string;
  label: string;
  threshold: number;
  critical: boolean;
}

export const SCORE_CONFIG: readonly ScoreConfig[] = [
  { key: 'human_writing_index', icon: '🧑', label: 'Human Writing', threshold: 75, critical: true },
  { key: 'virality_score', icon: '🔥', label: 'Virality', threshold: 70, critical: false },
  { key: 'engagement_score', icon: '💬', label: 'Engagement', threshold: 70, critical: false },
  { key: 'roi_score', icon: '💰', label: 'ROI', threshold: 70, critical: false },
  { key: 'trend_alignment', icon: '📈', label: 'Trend Alignment', threshold: 70, critical: false },
] as const;

/** Maps a 0-100 score to a token-backed CSS class. */
export function scoreToneClass(value: number): 'score-good' | 'score-warn' | 'score-bad' {
  if (value >= 75) return 'score-good';
  if (value >= 50) return 'score-warn';
  return 'score-bad';
}

/** Maps a score to a color for SVG rings. */
export function scoreColor(value: number): string {
  if (value >= 75) return 'var(--accent-success)';
  if (value >= 50) return 'var(--accent-warning)';
  return 'var(--accent-error)';
}
