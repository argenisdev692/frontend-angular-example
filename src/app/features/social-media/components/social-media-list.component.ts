import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';

import { SocialMediaFeatureService } from '../services/social-media-feature.service';
import {
  AdvancedFilterComponent,
  FilterField,
} from '../../../components/advanced-filter/advanced-filter.component';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { CrudListBase } from '../../../shared/crud-list-base';
import {
  PaginatedSocialMediaResponse,
  PLATFORMS,
  PlatformConfig,
  SocialMediaItem,
  scoreToneClass,
} from '../models/social-media.types';

@Component({
  selector: 'app-social-media-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    TableModule,
    ButtonModule,
    PaginatorModule,
    AdvancedFilterComponent,
    PageHeaderComponent,
    SidebarComponent,
  ],
  templateUrl: './social-media-list.component.html',
  styleUrl: './social-media-list.component.css',
})
export class SocialMediaListComponent extends CrudListBase<SocialMediaItem> {
  private api = inject(SocialMediaFeatureService);

  override get service() {
    return this.api;
  }

  get entityName(): string {
    return 'social media content';
  }
  get newRoute(): string {
    return '/social-media/generate';
  }
  get viewRoutePrefix(): string {
    return '/social-media';
  }
  get editRoutePrefix(): string {
    return '/social-media';
  }

  get filterFields(): FilterField[] {
    return [
      {
        key: 'search',
        label: 'Search',
        type: 'text',
        placeholder: 'Search by topic or niche...',
      },
      {
        key: 'dateRange',
        label: 'Date range',
        type: 'date-range',
        placeholder: 'Start — End',
      },
    ];
  }

  get tableColumns() {
    return [
      { field: 'topicTitle', header: 'Topic', sortable: false },
      { field: 'niche', header: 'Niche', sortable: false },
      { field: 'networks', header: 'Networks', sortable: false },
      { field: 'scores', header: 'Scores', sortable: false },
      { field: 'language', header: 'Language', sortable: false },
      { field: 'createdAt', header: 'Created', sortable: true },
    ];
  }

  /** Platform configs whose network flag is enabled on a row (for icon chips). */
  platformsFor(item: SocialMediaItem): PlatformConfig[] {
    const nets = item.networks ?? {};
    return PLATFORMS.filter((p) => nets[p.id]);
  }

  /** Token-backed class for a score chip (good/warn/bad by threshold). */
  chipClass(value: number): string {
    return 'score-chip ' + scoreToneClass(value);
  }

  buildQueryParams(
    page: number,
    limit: number,
    filters: Record<string, unknown>
  ): Record<string, unknown> {
    const params: Record<string, unknown> = { page, limit };

    const search = filters['search'] as string | undefined;
    if (search) params['search'] = search;

    const dateRange = filters['dateRange'] as Date[] | undefined;
    if (dateRange?.[0]) params['start_date'] = this.toIsoDate(dateRange[0]);
    if (dateRange?.[1]) params['end_date'] = this.toIsoDate(dateRange[1]);

    return params;
  }

  extractItems(response: PaginatedSocialMediaResponse): SocialMediaItem[] {
    return response?.data ?? [];
  }

  extractTotal(response: PaginatedSocialMediaResponse): number {
    return response?.total ?? 0;
  }

  // ── Template aliases ──
  readonly itemsList = this.items;
  readonly listResource = this.dataResource;

  /** Placeholder rows rendered while the list resource is loading. */
  readonly skeletonRows = [0, 1, 2, 3, 4, 5];

  onGenerate(): void {
    this.router.navigate(['/social-media/generate']);
  }

  onDownloadZip(id: string): void {
    this.api.downloadZip(id).then((blob) => {
      this.downloadBlob(blob, `social-media-${id}.zip`);
    });
  }
}
