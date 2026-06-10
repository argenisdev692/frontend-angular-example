import { PostResponse } from '../../../api/models/post-response';
import { PostListResponse } from '../../../api/models/post-list-response';
import { GenerateSocialIdeasResponse } from '../../../api/models/generate-social-ideas-response';
import { GenerateSocialPostResponse } from '../../../api/models/generate-social-post-response';

// ── Re-exported generated API models (compile-time types only) ──
export type {
  PostResponse,
  PostListResponse,
  GenerateSocialIdeasResponse,
  GenerateSocialPostResponse,
};

/** A single content idea row from the step-1 ideas response. */
export type SocialIdea = GenerateSocialIdeasResponse['content_ideas'][number];

/** One platform variation block from the step-2 post response. */
export type PlatformVariation =
  GenerateSocialPostResponse['platform_variations']['blog'];

// ── Manual create / update DTOs (body is loosely typed `string` in the
//    generated client; these give us a real shape to build against) ──
export interface CreatePostDto {
  postTitle: string;
  postContent?: string;
  postExcerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  categoryId?: string | null;
  postCoverImage?: string | null;
  postStatus?: 'draft' | 'published' | 'scheduled';
  scheduledAt?: string | null;
  generateWithAi?: boolean;
  aiNiche?: string;
  aiWordCount?: number;
}

export interface UpdatePostInput extends Partial<CreatePostDto> {}

// ── Generator request bodies (sent to the social endpoints) ──
export type AiProvider = 'gemini' | 'anthropic' | 'openai';

export interface GenerateIdeasRequest {
  niche: string;
  audience?: string;
  platforms: string[];
  goal?: string;
  voice?: string;
  company?: string;
  provider?: AiProvider;
}

export interface GeneratePostRequest {
  selectedIdea: SocialIdea;
  niche: string;
  audience?: string;
  goal?: string;
  voice?: string;
  company?: string;
  provider?: AiProvider;
}

// ── UI configuration (kept here so components stay declarative) ──
export type PlatformId = 'blog' | 'linkedin' | 'twitter' | 'newsletter' | 'facebook';

export interface PlatformConfig {
  id: PlatformId;
  label: string;
  icon: string;
  dims: string;
}

export const PLATFORMS: readonly PlatformConfig[] = [
  { id: 'blog', label: 'Blog', icon: '✍️', dims: '1200×628' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', dims: '1200×627' },
  { id: 'twitter', label: 'Twitter/X', icon: '𝕏', dims: '1200×675' },
  { id: 'newsletter', label: 'Newsletter', icon: '📬', dims: '600×400' },
  { id: 'facebook', label: 'Facebook', icon: '👥', dims: '1200×630' },
] as const;

export const GOALS: readonly string[] = [
  'awareness',
  'leads',
  'thought_leadership',
  'engagement',
  'sales',
];

export const VOICES: readonly string[] = [
  'professional',
  'conversational',
  'technical',
  'inspirational',
  'urgent',
];

export interface ProviderConfig {
  id: AiProvider;
  label: string;
  icon: string;
}

export const AI_PROVIDERS: readonly ProviderConfig[] = [
  { id: 'gemini', label: 'Gemini', icon: '✨' },
  { id: 'anthropic', label: 'Claude', icon: '🤖' },
  { id: 'openai', label: 'OpenAI', icon: '🧠' },
];

/** The five threshold-gated quality scores (excludes summary / ai_detection_risk). */
export type MainScoreKey =
  | 'human_writing_index'
  | 'eeat_score'
  | 'virality_score'
  | 'roi_score'
  | 'seo_score';

/** Score metadata used to render the result panel (thresholds from the spec). */
export interface ScoreConfig {
  key: MainScoreKey;
  icon: string;
  label: string;
  threshold: number;
  critical: boolean;
}

export const SCORE_CONFIG: readonly ScoreConfig[] = [
  { key: 'human_writing_index', icon: '🧑', label: 'Human Writing', threshold: 75, critical: true },
  { key: 'eeat_score', icon: '⭐', label: 'EEAT', threshold: 70, critical: false },
  { key: 'virality_score', icon: '🔥', label: 'Virality', threshold: 70, critical: false },
  { key: 'roi_score', icon: '💰', label: 'ROI', threshold: 70, critical: false },
  { key: 'seo_score', icon: '🔍', label: 'SEO', threshold: 70, critical: false },
];

/** Maps a 0-100 score to a token-backed CSS class (no hex in templates). */
export function scoreToneClass(value: number): 'score-good' | 'score-warn' | 'score-bad' {
  if (value >= 75) return 'score-good';
  if (value >= 50) return 'score-warn';
  return 'score-bad';
}
