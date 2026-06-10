import { Routes } from '@angular/router';
import { ContactSupportListComponent } from './components/contact-support-list.component';
import { ContactSupportDetailComponent } from './components/contact-support-detail.component';

export const contactSupportRoutes: Routes = [
  { path: '', component: ContactSupportListComponent },
  { path: ':id', component: ContactSupportDetailComponent },
];
