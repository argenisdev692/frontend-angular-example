import { inject, signal, computed, resource } from '@angular/core';
import { Router } from '@angular/router';
import {
  FilterField,
  FilterCriteria,
} from '../components/advanced-filter/advanced-filter.component';

export interface CrudListService<TEntity> {
  getAll(params: any): Promise<any>;
  delete(id: string): Promise<any>;
  restore?(id: string): Promise<any>;
  export(params: any): Promise<Blob>;
}

export abstract class CrudListBase<TEntity> {
  protected router = inject(Router);

  abstract get service(): CrudListService<TEntity>;
  abstract get entityName(): string;
  abstract get newRoute(): string;
  abstract get viewRoutePrefix(): string;
  abstract get editRoutePrefix(): string;
  abstract get filterFields(): FilterField[];
  abstract get tableColumns(): Array<{
    field: string;
    header: string;
    sortable?: boolean;
  }>;

  abstract buildQueryParams(
    page: number,
    limit: number,
    filters: Record<string, unknown>
  ): Record<string, unknown>;
  abstract extractItems(response: any): TEntity[];
  abstract extractTotal(response: any): number;

  readonly drawerVisible = signal(false);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly filterParams = signal<Record<string, unknown>>({});

  readonly queryParams = computed(() =>
    this.buildQueryParams(this.page(), this.limit(), this.filterParams())
  );

  readonly dataResource = resource({
    loader: () => this.service.getAll(this.queryParams()),
  });

  readonly items = computed(() =>
    this.extractItems(this.dataResource.value())
  );
  readonly total = computed(() =>
    this.extractTotal(this.dataResource.value())
  );
  readonly isLoading = computed(() => this.dataResource.isLoading());

  onFiltersChange(criteria: FilterCriteria): void {
    this.filterParams.set({ ...criteria });
    this.page.set(1);
  }

  onPageChange(event: any): void {
    this.page.set((event.page ?? 0) + 1);
    this.limit.set(event.rows ?? 10);
  }

  onCreate(): void {
    this.router.navigate([this.newRoute]);
  }

  onView(id: string): void {
    this.router.navigate([this.viewRoutePrefix, id]);
  }

  onEdit(item: any): void {
    this.router.navigate([this.editRoutePrefix, item.id, 'edit']);
  }

  onDelete(id: string): void {
    if (!confirm(`Are you sure you want to delete this ${this.entityName}?`))
      return;
    this.service.delete(id).then(() => this.dataResource.reload());
  }

  onRestore(id: string): void {
    if (!this.service.restore) return;
    this.service.restore(id).then(() => this.dataResource.reload());
  }

  isTrashed(item: any): boolean {
    return item?.deletedAt !== null;
  }

  onExportPdf(): void {
    this.service
      .export(this.buildExportParams())
      .then((blob) => this.downloadBlob(blob, `${this.entityName}.pdf`));
  }

  onExportExcel(): void {
    this.service
      .export(this.buildExportParams())
      .then((blob) => this.downloadBlob(blob, `${this.entityName}.xlsx`));
  }

  protected buildExportParams(): {
    onlyTrashed?: boolean;
    withTrashed?: boolean;
  } {
    const filters = this.filterParams();
    const status = filters['status'] as string | undefined;
    if (status === 'active') return { withTrashed: false };
    if (status && status !== 'all') return { onlyTrashed: true };
    return {};
  }

  protected toIsoDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  protected downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
