import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CompanyDataService } from '../../../api/services/company-data.service';
import { ApiConfiguration } from '../../../api/api-configuration';
import { CompanyDataResponse } from '../../../api/models/company-data-response';

export interface UpdateCompanyDataDto {
  companyName?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  taxId?: string | null;
  address?: string | null;
  address2?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  facebookLink?: string | null;
  instagramLink?: string | null;
  twitterLink?: string | null;
  linkedinLink?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CompanyDataFeatureService {
  private apiService = inject(CompanyDataService);
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);

  async findMyCompanyData(): Promise<CompanyDataResponse> {
    return this.apiService.companyDataControllerGetMyCompanyData();
  }

  async update(id: string, body: UpdateCompanyDataDto): Promise<CompanyDataResponse> {
    const rootUrl = (this.config.rootUrl || '').replace(/\/$/, '');
    const url = `${rootUrl}/api/v1/company-data/${encodeURIComponent(id)}`;
    return firstValueFrom(
      this.http.patch<CompanyDataResponse>(url, body)
    );
  }

  async uploadSignature(id: string, file: File): Promise<CompanyDataResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const rootUrl = (this.config.rootUrl || '').replace(/\/$/, '');
    const url = `${rootUrl}/api/v1/company-data/${encodeURIComponent(id)}/signature`;
    return firstValueFrom(
      this.http.post<CompanyDataResponse>(url, formData)
    );
  }

  async deleteSignature(id: string): Promise<CompanyDataResponse> {
    const rootUrl = (this.config.rootUrl || '').replace(/\/$/, '');
    const url = `${rootUrl}/api/v1/company-data/${encodeURIComponent(id)}/signature`;
    return firstValueFrom(
      this.http.delete<CompanyDataResponse>(url)
    );
  }
}
