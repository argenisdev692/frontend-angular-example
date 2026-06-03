import { Routes } from '@angular/router';
import { LoginFormComponent } from '../../components/login-form/login-form.component';

export const authRoutes: Routes = [
  {
    path: 'login',
    component: LoginFormComponent
  }
];
