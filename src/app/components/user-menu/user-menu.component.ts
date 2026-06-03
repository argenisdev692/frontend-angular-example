import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthFeatureService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-user-menu',
  imports: [CommonModule, ButtonModule, MenuModule],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.css'
})
export class UserMenuComponent {
  private authService = inject(AuthFeatureService);
  private router = inject(Router);

  protected readonly user = this.authService.currentUser;

  protected readonly userInitials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    const first = u.name?.charAt(0) ?? '';
    const last = u.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || (u.username?.charAt(0) ?? '').toUpperCase();
  });

  protected readonly primaryRole = computed(() => {
    const roles = this.user()?.roles;
    return roles && roles.length > 0 ? roles[0].name : 'User';
  });

  protected readonly menuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile'])
    },
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      styleClass: 'menu-item-logout',
      command: () => this.logout()
    }
  ];

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
