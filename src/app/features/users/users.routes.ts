import { Routes } from '@angular/router';
import { UsersListComponent } from './components/users-list.component';
import { UsersFormComponent } from './components/users-form.component';
import { UsersDetailComponent } from './components/users-detail.component';
import { UserPermissionsComponent } from './components/user-permissions.component';

export const usersRoutes: Routes = [
  { path: '', component: UsersListComponent },
  { path: 'new', component: UsersFormComponent },
  { path: ':id', component: UsersDetailComponent },
  { path: ':id/edit', component: UsersFormComponent },
  { path: ':id/permissions', component: UserPermissionsComponent },
];
