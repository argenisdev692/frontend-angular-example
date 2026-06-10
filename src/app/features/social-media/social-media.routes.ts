import { Routes } from '@angular/router';
import { SocialMediaListComponent } from './components/social-media-list.component';
import { SocialMediaGeneratorComponent } from './components/social-media-generator.component';
import { SocialMediaDetailComponent } from './components/social-media-detail.component';

export const socialMediaRoutes: Routes = [
  { path: '', component: SocialMediaListComponent },
  { path: 'generate', component: SocialMediaGeneratorComponent },
  { path: ':id', component: SocialMediaDetailComponent },
];
