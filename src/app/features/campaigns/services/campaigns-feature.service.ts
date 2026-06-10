import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { CampaignsService } from '../../../api/services/campaigns.service';
import { CompanyDataService } from '../../../api/services/company-data.service';
import { ApiConfiguration } from '../../../api/api-configuration';
import { CampaignsControllerListCampaigns$Params } from '../../../api/fn/campaigns/campaigns-controller-list-campaigns';
import { CompanyDataResponse } from '../../../api/models/company-data-response';
import { BulkIdsPayload } from '../../../shared/crud-list-base';
import {
  CampaignExportListItemResponse,
  CampaignExportStatusResponse,
  GenerateCampaignBody,
  GenerateTopicsBody,
  GenerateTopicsResponse,
  RequestCampaignExportBody,
} from '../models/campaigns.types';

@Injectable({ providedIn: 'root' })
export class CampaignsFeatureService {
  private api = inject(CampaignsService);
  private companyApi = inject(CompanyDataService);
  private apiConfig = inject(ApiConfiguration);
  private http = inject(HttpClient);

  // ── List / detail (CrudListBase reads `getAll`/`delete`) ──
  getAll(
    params?: CampaignsControllerListCampaigns$Params
  ): Promise<Array<CampaignExportListItemResponse>> {
    return this.api.campaignsControllerListCampaigns(params);
  }

  getById(id: string): Promise<CampaignExportStatusResponse> {
    return this.api.campaignsControllerGetCampaign({ id });
  }

  delete(id: string): Promise<void> {
    return this.api.campaignsControllerDeleteCampaign({ id });
  }

  // ── Bulk (hard-delete only — no restore on this resource) ──
  bulkDelete(dto: BulkIdsPayload): Promise<void> {
    return this.api.campaignsControllerBulkDeleteCampaigns({ body: dto });
  }

  /**
   * Export the generation history as a file. The generated client discards the
   * body, so we GET the blob via HttpClient (the auth interceptor adds the
   * in-memory Bearer token automatically).
   */
  export(params?: { onlyTrashed?: boolean; withTrashed?: boolean }): Promise<Blob> {
    const url = `${this.apiConfig.rootUrl}/api/v1/campaigns/exports/export`;
    let httpParams = new HttpParams();
    if (params?.onlyTrashed) httpParams = httpParams.set('onlyTrashed', 'true');
    if (params?.withTrashed) httpParams = httpParams.set('withTrashed', 'true');
    return firstValueFrom(
      this.http.get(url, { params: httpParams, responseType: 'blob' })
    );
  }

  // ── Generator: Step 1 — topics ──
  /**
   * Generate the 10 campaign topics (Step 1). The generated client throws away
   * the JSON body (`responseType: 'text'`), so we POST via HttpClient to read
   * the real payload; the auth interceptor adds the Bearer token.
   */
  generateTopics(body: GenerateTopicsBody): Promise<GenerateTopicsResponse> {
    const url = `${this.apiConfig.rootUrl}/api/v1/campaigns/generate-topics`;
    return firstValueFrom(this.http.post<GenerateTopicsResponse>(url, body));
  }

  // ── Generator: Step 2 — enqueue generation job ──
  /**
   * Generate a campaign from a selected topic (Step 2). This enqueues a
   * background job; progress is delivered server-side via WebSocket and the
   * persisted generation surfaces in the list/detail views.
   */
  generateCampaign(body: GenerateCampaignBody): Promise<void> {
    return this.api.campaignsControllerGenerateCampaign({ body });
  }

  /** Request a multi-stage video export (TOFU/MOFU/BOFU/LOYALTY) job. */
  requestExport(body: RequestCampaignExportBody): Promise<void> {
    return this.api.campaignsControllerRequestExport({ body });
  }

  // ── Company context (companyDataId is required by the generation bodies) ──
  getMyCompanyData(): Promise<CompanyDataResponse> {
    return this.companyApi.companyDataControllerGetMyCompanyData();
  }
}
