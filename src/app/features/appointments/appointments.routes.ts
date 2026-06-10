import { Routes } from '@angular/router';
import { AppointmentsListComponent } from './components/appointments-list.component';
import { AppointmentsFormComponent } from './components/appointments-form.component';
import { AppointmentsDetailComponent } from './components/appointments-detail.component';

export const appointmentsRoutes: Routes = [
  { path: '', component: AppointmentsListComponent },
  { path: 'new', component: AppointmentsFormComponent },
  { path: ':id', component: AppointmentsDetailComponent },
  { path: ':id/edit', component: AppointmentsFormComponent },
];
