import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { SocialMediaService } from '../../../api/services/social-media.service';
import { ApiConfiguration } from '../../../api/api-configuration';
import { PaginatedSocialMediaResponse } from '../../../api/models/paginated-social-media-response';
import { SocialMediaGenerationResponse } from '../../../api/models/social-media-generation-response';
import { SocialMediaTopicResponse } from '../../../api/models/social-media-topic-response';
import { GeneratePostJobResultDto } from '../../../api/models/generate-post-job-result-dto';
import { BulkIdsPayload } from '../../../shared/crud-list-base';
import {
  FindTopicsRequest,
  GenerateContentRequest,
} from '../models/social-media.types';

@Injectable({ providedIn: 'root' })
export class SocialMediaFeatureService {
  private api = inject(SocialMediaService);
  private apiConfig = inject(ApiConfiguration);
  private http = inject(HttpClient);

  // ── CRUD / History ──
  getAll(params?: Record<string, unknown>): Promise<PaginatedSocialMediaResponse> {
    const p = params ?? {};
    const str = (v: unknown): string | undefined =>
      typeof v === 'string' && v.length > 0 ? v : undefined;
    const num = (v: unknown): number | undefined =>
      typeof v === 'number' ? v : undefined;

    // The list endpoint exposes `niche` (not a generic `search`) as its text
    // filter, so map the search box onto it.
    return this.api.socialMediaControllerList({
      page: num(p['page']),
      limit: num(p['limit']),
      niche: str(p['niche']) ?? str(p['search']),
      language: str(p['language']),
      start_date: str(p['start_date']),
      end_date: str(p['end_date']),
    });
  }

  getById(id: string): Promise<SocialMediaGenerationResponse> {
    return this.api.socialMediaControllerFindOne({ id });
  }

  delete(id: string): Promise<void> {
    return this.api.socialMediaControllerRemove({ id });
  }

  bulkDelete(dto: BulkIdsPayload): Promise<{ count?: number }> {
    return this.api.socialMediaControllerBulkDelete({ body: dto });
  }

  // ── Export ──
  export(dto: { format?: 'csv' | 'xlsx' | 'pdf'; network?: string; niche?: string; start_date?: string; end_date?: string; language?: string }): Promise<Blob> {
    const url = `${this.apiConfig.rootUrl}/api/v1/social-media/export`;
    return firstValueFrom(
      this.http.post(url, dto, { responseType: 'blob' })
    );
  }

  // ── Download ZIP ──
  downloadZip(id: string): Promise<Blob> {
    const url = `${this.apiConfig.rootUrl}/api/v1/social-media/${id}/download-zip`;
    return firstValueFrom(this.http.post(url, null, { responseType: 'blob' }));
  }

  // ── AI Generator (2-step flow) ──
  findTopics(req: FindTopicsRequest): Promise<SocialMediaTopicResponse[]> {
    return this.api.socialMediaControllerFindTopics({
      body: {
        niche: req.niche,
        language: req.language,
        maxTopics: req.maxTopics ?? 10,
      },
    });
  }

  generateContent(req: GenerateContentRequest): Promise<GeneratePostJobResultDto> {
    return this.api.socialMediaControllerGenerate({
      body: {
        topic: req.topic,
        networks: req.networks,
        language: req.language,
        saveToHistory: req.saveToHistory ?? true,
        topicId: req.topicId,
      },
    });
  }
}
