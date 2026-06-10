import { Routes } from '@angular/router';
import { BackupsListComponent } from './components/backups-list.component';
import { BackupsDetailComponent } from './components/backups-detail.component';

export const backupsRoutes: Routes = [
  { path: '', component: BackupsListComponent },
  { path: ':id', component: BackupsDetailComponent },
];
