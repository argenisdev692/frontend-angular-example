import { Routes } from '@angular/router';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { DashboardComponent } from './dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CompanyDataEditComponent } from './features/company-data/components/company-data-edit.component';
import { authGuard } from './features/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginFormComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'company-data', component: CompanyDataEditComponent, canActivate: [authGuard] },
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.routes').then((m) => m.usersRoutes),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
