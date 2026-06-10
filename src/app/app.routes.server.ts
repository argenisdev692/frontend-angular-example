import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client
  },
  {
    // Auth-guarded CRUD routes (users, appointments, roles, ...) carry an
    // in-memory token and use :id params, so they cannot be prerendered.
    path: '**',
    renderMode: RenderMode.Client
  }
];
