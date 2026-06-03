import { Injectable, inject } from '@angular/core';
import { ActivityLogsService } from '../../../api/services/activity-logs.service';
import { ActivityLogResponse } from '../../../api/models/activity-log-response';
import { ActivityLogControllerFindAll$Params } from '../../../api/fn/activity-logs/activity-log-controller-find-all';

@Injectable({ providedIn: 'root' })
export class ActivityLogsFeatureService {
  private api = inject(ActivityLogsService);

  getAll(params?: ActivityLogControllerFindAll$Params): Promise<ActivityLogResponse[]> {
    return this.api.activityLogControllerFindAll(params);
  }

  getById(id: string): Promise<ActivityLogResponse> {
    return this.api.activityLogControllerFindOne({ id });
  }

  delete(id: string): Promise<void> {
    return this.api.activityLogControllerRemove({ id });
  }

  export(_params?: { onlyTrashed?: boolean; withTrashed?: boolean }): Promise<Blob> {
    return Promise.resolve(new Blob([]));
  }
}
