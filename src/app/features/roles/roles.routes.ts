import { Routes } from '@angular/router';
import { RolesListComponent } from './components/roles-list.component';
import { RolesFormComponent } from './components/roles-form.component';
import { RolesDetailComponent } from './components/roles-detail.component';

export const rolesRoutes: Routes = [
  { path: '', component: RolesListComponent },
  { path: 'new', component: RolesFormComponent },
  { path: ':id', component: RolesDetailComponent },
  { path: ':id/edit', component: RolesFormComponent },
];
