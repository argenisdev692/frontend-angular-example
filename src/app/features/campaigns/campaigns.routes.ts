import { Routes } from '@angular/router';
import { CampaignsListComponent } from './components/campaigns-list.component';
import { CampaignsGeneratorComponent } from './components/campaigns-generator.component';
import { CampaignsDetailComponent } from './components/campaigns-detail.component';

export const campaignsRoutes: Routes = [
  { path: '', component: CampaignsListComponent },
  { path: 'generate', component: CampaignsGeneratorComponent },
  { path: ':id', component: CampaignsDetailComponent },
];
