import { Injectable, inject } from '@angular/core';
import { ContactSupportService } from '../../../api/services/contact-support.service';
import { ContactSupportResponse } from '../../../api/models/contact-support-response';
import { ContactSupportListResponse } from '../../../api/models/contact-support-list-response';
import { ContactSupportControllerList$Params } from '../../../api/fn/contact-support/contact-support-controller-list';
import { BulkIdsDto } from '../../../api/models/bulk-ids-dto';

type ExportParams = { onlyTrashed?: boolean; withTrashed?: boolean };

@Injectable({ providedIn: 'root' })
export class ContactSupportFeatureService {
  private api = inject(ContactSupportService);

  getAll(params?: ContactSupportControllerList$Params): Promise<ContactSupportListResponse> {
    return this.api.contactSupportControllerList(params);
  }

  getById(id: string, withTrashed = true): Promise<ContactSupportResponse> {
    return this.api.contactSupportControllerFindOne({ id, withTrashed });
  }

  markAsRead(id: string): Promise<void> {
    return this.api.contactSupportControllerMarkAsRead({ id });
  }

  delete(id: string): Promise<void> {
    return this.api.contactSupportControllerRemove({ id });
  }

  restore(id: string): Promise<void> {
    return this.api.contactSupportControllerRestore({ id });
  }

  bulkDelete(dto: BulkIdsDto): Promise<unknown> {
    return this.api.contactSupportControllerBulkDelete({ body: dto });
  }

  bulkRestore(dto: BulkIdsDto): Promise<unknown> {
    return this.api.contactSupportControllerBulkRestore({ body: dto });
  }

  // PDF export — used by CrudListBase.onExportPdf (binary blob).
  export(params?: ExportParams): Promise<Blob> {
    return this.api.contactSupportControllerExport$Pdf({
      format: 'pdf',
      ...params,
    }) as Promise<Blob>;
  }

  // CSV export — endpoint returns text/csv; wrap it in a Blob for download.
  async exportCsv(params?: ExportParams): Promise<Blob> {
    const text = await this.api.contactSupportControllerExport$Csv({
      format: 'csv',
      ...params,
    });
    return new Blob([text as string], { type: 'text/csv;charset=utf-8;' });
  }
}
