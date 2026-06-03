import {
  Component,
  inject,
  signal,
  computed,
  resource,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';

import { UsersFeatureService } from '../services/users-feature.service';
import {
  AdvancedFilterComponent,
  FilterField,
  FilterCriteria,
} from '../../../components/advanced-filter/advanced-filter.component';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TableModule,
    ButtonModule,
    PaginatorModule,
    AdvancedFilterComponent,
    PageHeaderComponent,
    SidebarComponent,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent {
  private service = inject(UsersFeatureService);
  private router = inject(Router);

  readonly drawerVisible = signal(false);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly filterParams = signal<Record<string, unknown>>({});

  readonly queryParams = computed(() => {
    const params: Record<string, unknown> = {
      page: this.page(),
      limit: this.limit(),
    };

    const filters = this.filterParams();
    if (filters['search']) {
      params['search'] = filters['search'];
    }

    const dateRange = filters['dateRange'] as Date[] | undefined;
    if (dateRange?.[0]) {
      params['start_date'] = this.toIsoDate(dateRange[0]);
    }
    if (dateRange?.[1]) {
      params['end_date'] = this.toIsoDate(dateRange[1]);
    }

    const status = filters['status'] as string | undefined;
    if (status === 'all') {
      params['withTrashed'] = true;
    } else if (status === 'suspended') {
      params['onlyTrashed'] = true;
    }
    // 'active' or no selection = default (active only), no extra params needed

    return params;
  });

  readonly usersResource = resource({
    loader: () =>
      this.service.getAll(this.queryParams() as any),
  });

  readonly users = computed(() => this.usersResource.value()?.data ?? []);
  readonly total = computed(() => this.usersResource.value()?.total ?? 0);
  readonly isLoading = computed(() => this.usersResource.isLoading());

  readonly filterFields: FilterField[] = [
    {
      key: 'dateRange',
      label: 'Date range',
      type: 'date-range',
      placeholder: 'Start — End',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'All', value: 'all' },
      ],
      placeholder: 'All',
    },
  ];

  readonly tableColumns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'phone', header: 'Phone', sortable: false },
    { field: 'roles', header: 'Roles', sortable: false },
    { field: 'createdAt', header: 'Created', sortable: true },
  ];

  onFiltersChange(criteria: FilterCriteria): void {
    this.filterParams.set({ ...criteria });
    this.page.set(1);
  }

  onPageChange(event: any): void {
    this.page.set((event.page ?? 0) + 1);
    this.limit.set(event.rows ?? 10);
  }

  onCreate(): void {
    this.router.navigate(['/users', 'new']);
  }

  onExportPdf(): void {
    const params = this.buildExportParams();
    this.service.export(params).then((blob) => this.downloadBlob(blob, 'users.pdf'));
  }

  onExportExcel(): void {
    const params = this.buildExportParams();
    this.service.export(params).then((blob) => this.downloadBlob(blob, 'users.xlsx'));
  }

  private buildExportParams(): { onlyTrashed?: boolean; withTrashed?: boolean } {
    const filters = this.filterParams();
    const status = filters['status'] as string | undefined;
    if (status === 'active') {
      return { withTrashed: false };
    }
    if (status === 'suspended') {
      return { onlyTrashed: true };
    }
    return {};
  }

  onView(id: string): void {
    this.router.navigate(['/users', id]);
  }

  onEdit(user: any): void {
    this.router.navigate(['/users', user.id, 'edit']);
  }

  onDelete(id: string): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.service.delete(id).then(() => {
      this.usersResource.reload();
    });
  }

  getRoleNames(user: any): string {
    return user.roles?.map((r: any) => r.name).join(', ') ?? '—';
  }

  isSuspended(user: any): boolean {
    return user.deletedAt !== null;
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
