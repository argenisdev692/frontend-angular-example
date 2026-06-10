import { Routes } from '@angular/router';
import { PostsListComponent } from './components/posts-list.component';
import { PostGeneratorComponent } from './components/post-generator.component';
import { PostsFormComponent } from './components/posts-form.component';
import { PostsDetailComponent } from './components/posts-detail.component';

export const postsRoutes: Routes = [
  { path: '', component: PostsListComponent },
  { path: 'generate', component: PostGeneratorComponent },
  { path: 'new', component: PostsFormComponent },
  { path: ':id', component: PostsDetailComponent },
  { path: ':id/edit', component: PostsFormComponent },
];
