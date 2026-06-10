import { z } from 'zod';
import { SocialMediaItem } from './social-media.types';

/**
 * Runtime validation for the social-media detail trust boundary (OWASP).
 *
 * `getById` is fetched by id and rendered directly; this schema is what stands
 * between an unexpected/hostile payload and the UI. It mirrors the generated
 * `SocialMediaGenerationResponse` / `SocialMediaItem` shape and stays lenient on
 * rarely-displayed/optional fields (`.nullish()`) so minor backend drift never
 * blanks a valid record — only the structural essentials are required.
 */

const generatedPostSchema = z.object({
  body: z.string(),
  hashtags: z.array(z.string()),
  emojis: z.string().nullish(),
  hook: z.string().nullish(),
  image: z
    .object({
      url: z.string().nullish(),
      r2Key: z.string().nullish(),
      mimeType: z.string().nullish(),
    })
    .nullish(),
});

const aiDetectionScoreSchema = z
  .object({
    aiGenerated: z.number(),
    aiParaphrased: z.number(),
    humanWritten: z.number(),
    showsAiSigns: z.number(),
  })
  .nullish();

export const socialMediaItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  niche: z.string(),
  topicTitle: z.string(),
  topicDescription: z.string().nullable(),
  language: z.string().nullable(),
  networks: z.record(z.string(), z.boolean()),
  generatedPosts: z.record(z.string(), generatedPostSchema),
  r2Key: z.string().nullish(),
  viralityScore: z.number().nullish(),
  roiScore: z.number().nullish(),
  aiDetectionScore: aiDetectionScoreSchema,
  analysisReportKey: z.string().nullish(),
  analysisReportUrl: z.string().nullish(),
  createdAt: z.string(),
});

/**
 * Parse a social-media detail payload, returning a value assignable to the
 * generated `SocialMediaItem`. Throws on mismatch — the detail view already
 * surfaces an error/retry state when the resource loader rejects.
 */
export function parseSocialMediaItem(data: unknown): SocialMediaItem {
  return socialMediaItemSchema.parse(data) as SocialMediaItem;
}
