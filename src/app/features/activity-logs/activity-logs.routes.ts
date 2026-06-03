import { Routes } from '@angular/router';
import { ActivityLogsListComponent } from './components/activity-logs-list.component';
import { ActivityLogsDetailComponent } from './components/activity-logs-detail.component';

export const activityLogsRoutes: Routes = [
  { path: '', component: ActivityLogsListComponent },
  { path: ':id', component: ActivityLogsDetailComponent },
];
