import { Component, input, model, computed, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MenuItem } from 'primeng/api';
import { AuthFeatureService } from '../../features/auth/services/auth.service';
import { ThemeService } from '../../features/auth/services/theme.service';

interface NavItem {
  icon: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, FormsModule, DrawerModule, MenuModule, ToggleSwitchModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private authService = inject(AuthFeatureService);
  private themeService = inject(ThemeService);

  // Two-way bound visibility so the parent can toggle the drawer menu.
  visible = model(false);

  companyName = input('Aquashield Restoration LLC');

  protected readonly user = this.authService.currentUser;

  menuItems = input<NavItem[]>([
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>', label: 'Dashboard', active: true },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>', label: 'Analytics', active: false },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', label: 'Users', active: false },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>', label: 'Projects', active: false },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>', label: 'Settings', active: false },
  ]);

  menuModel = computed<MenuItem[]>(() => this.menuItems() as unknown as MenuItem[]);

  getMenuItemClasses(active: boolean): string {
    return `menu-item ${active ? 'active' : ''}`;
  }

  get userInitials(): string {
    const u = this.user();
    if (!u) return '?';
    const first = u.name?.charAt(0) ?? '';
    const last = u.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || u.username.charAt(0).toUpperCase();
  }

  get primaryRole(): string {
    const roles = this.user()?.roles;
    return roles && roles.length > 0 ? roles[0].name : 'User';
  }

  // Theme toggle: p-toggleswitch checked means "dark mode on"
  protected readonly isDark = computed(() => this.themeService.mode() === 'dark');

  protected onThemeToggle(checked: boolean): void {
    this.themeService.set(checked ? 'dark' : 'light');
  }

  goToProfile(): void {
    this.visible.set(false);
    this.router.navigate(['/profile']);
  }

  onDrawerHide(): void {
    this.visible.set(false);
    this.cdr.markForCheck();
  }
}
