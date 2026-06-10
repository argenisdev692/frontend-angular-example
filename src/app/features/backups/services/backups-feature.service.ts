import { Injectable, inject } from '@angular/core';
import { BackupsService } from '../../../api/services/backups.service';
import { BackupResponse } from '../../../api/models/backup-response';
import { BackupListResponse } from '../../../api/models/backup-list-response';
import { BackupTriggeredResponse } from '../../../api/models/backup-triggered-response';
import { BackupControllerFindAll$Params } from '../../../api/fn/backups/backup-controller-find-all';

@Injectable({ providedIn: 'root' })
export class BackupsFeatureService {
  private api = inject(BackupsService);

  getAll(params?: BackupControllerFindAll$Params): Promise<BackupListResponse> {
    return this.api.backupControllerFindAll(params);
  }

  getById(id: string): Promise<BackupResponse> {
    return this.api.backupControllerFindOne({ id });
  }

  delete(id: string): Promise<void> {
    return this.api.backupControllerRemove({ id });
  }

  trigger(): Promise<BackupTriggeredResponse> {
    return this.api.backupControllerTrigger();
  }

  download(id: string): Promise<Blob> {
    return this.api.backupControllerDownload({ id }) as Promise<Blob>;
  }

  export(_params?: { onlyTrashed?: boolean; withTrashed?: boolean }): Promise<Blob> {
    return this.api.backupControllerExport$VndOpenxmlformatsOfficedocumentSpreadsheetmlSheet({
      format: 'xlsx',
    }) as Promise<Blob>;
  }

  exportPdf(): Promise<Blob> {
    return this.api.backupControllerExport$Pdf({ format: 'pdf' }) as Promise<Blob>;
  }
}
