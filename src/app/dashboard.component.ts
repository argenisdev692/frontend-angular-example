import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { AnimatedButtonComponent } from './components/animated-button/animated-button.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { AuthService } from './api/services/auth.service';
import { UserResponse } from './api/models/user-response';
import { CompanyDataService } from './api/services/company-data.service';
import { CompanyDataResponse } from './api/models/company-data-response';

interface NotificationItem {
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule, SidebarComponent, DashboardCardComponent, AnimatedButtonComponent, UserMenuComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private companyDataService = inject(CompanyDataService);

  // Controls the PrimeNG drawer menu visibility.
  protected readonly drawerVisible = signal(false);

  // User data from /me endpoint
  protected readonly user = signal<UserResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Company data from public endpoint
  protected readonly companyData = signal<CompanyDataResponse | null>(null);
  protected readonly companyName = computed(() => this.companyData()?.companyName ?? 'Aquashield Restoration LLC');
  protected readonly companyTaxId = computed(() => this.companyData()?.taxId ?? '');

  // ── Header notification dropdowns ──
  notificationsOpen = signal(false);
  messagesOpen = signal(false);
  inboxOpen = signal(false);

  notifications = signal<NotificationItem[]>([
    { title: 'New claim assigned', message: 'Claim #2342 has been assigned to you', time: '2 min ago', unread: true },
    { title: 'Payment received', message: '$12,500 from ABC Corp', time: '1 hour ago', unread: true },
    { title: 'System update', message: 'Dashboard v2.1 is now live', time: '3 hours ago', unread: false },
  ]);

  messages = signal<NotificationItem[]>([
    { title: 'Sarah Johnson', message: 'Can we reschedule the meeting?', time: '10 min ago', unread: true },
    { title: 'Mike Chen', message: 'The report is ready for review', time: '45 min ago', unread: true },
    { title: 'Support Team', message: 'Your ticket #8921 is resolved', time: '2 hours ago', unread: false },
  ]);

  inbox = signal<NotificationItem[]>([
    { title: 'Invoice #4451', message: 'New invoice from AquaSupply Inc', time: '30 min ago', unread: true },
    { title: 'Contract renewal', message: 'Annual contract expires in 7 days', time: '1 day ago', unread: false },
  ]);

  unreadCount(items: NotificationItem[]): number {
    return items.filter(i => i.unread).length;
  }

  toggleDropdown(type: 'notifications' | 'messages' | 'inbox', event: Event): void {
    event.stopPropagation();
    this.notificationsOpen.set(type === 'notifications' ? !this.notificationsOpen() : false);
    this.messagesOpen.set(type === 'messages' ? !this.messagesOpen() : false);
    this.inboxOpen.set(type === 'inbox' ? !this.inboxOpen() : false);
  }

  closeDropdowns(): void {
    this.notificationsOpen.set(false);
    this.messagesOpen.set(false);
    this.inboxOpen.set(false);
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadCompanyData();

    // Close dropdowns on outside click
    if (typeof document !== 'undefined') {
      document.addEventListener('click', () => this.closeDropdowns());
    }
  }

  private async loadUserData(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);
      const userData = await this.authService.authControllerMe();
      this.user.set(userData);
    } catch {
      this.error.set('Failed to load user data');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadCompanyData(): Promise<void> {
    try {
      const data = await this.companyDataService.companyDataControllerFindPublic();
      this.companyData.set(data);
    } catch {
      /* silently fail, fallback to hardcoded */
    }
  }
}
