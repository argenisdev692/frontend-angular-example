import { Routes } from '@angular/router';
import { BlogCategoriesListComponent } from './components/blog-categories-list.component';
import { BlogCategoriesFormComponent } from './components/blog-categories-form.component';
import { BlogCategoriesDetailComponent } from './components/blog-categories-detail.component';

export const blogCategoriesRoutes: Routes = [
  { path: '', component: BlogCategoriesListComponent },
  { path: 'new', component: BlogCategoriesFormComponent },
  { path: ':id', component: BlogCategoriesDetailComponent },
  { path: ':id/edit', component: BlogCategoriesFormComponent },
];
