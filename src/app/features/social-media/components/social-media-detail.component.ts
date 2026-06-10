import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  resource,
  signal,
} from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { SocialMediaFeatureService } from '../services/social-media-feature.service';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import {
  GeneratedPost,
  PLATFORMS,
  SocialMediaPlatformId,
  scoreColor,
} from '../models/social-media.types';
import { parseSocialMediaItem } from '../models/social-media.schemas';

@Component({
  selector: 'app-social-media-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, PageHeaderComponent, SidebarComponent],
  templateUrl: './social-media-detail.component.html',
  styleUrl: './social-media-detail.component.css',
})
export class SocialMediaDetailComponent {
  private service = inject(SocialMediaFeatureService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    // Recover from an SSR-hydration error: the in-memory token isn't present on
    // the server, so getById fails there — reload once in the browser.
    let hasAutoReloaded = false;
    effect(() => {
      if (
        isPlatformBrowser(this.platformId) &&
        this.itemResource.status() === 'error' &&
        !hasAutoReloaded
      ) {
        hasAutoReloaded = true;
        this.itemResource.reload();
      }
    });
  }

  readonly platforms = PLATFORMS;
  readonly drawerVisible = signal(false);
  readonly itemId = signal<string>(this.route.snapshot.params['id']);
  readonly downloading = signal(false);
  readonly copiedKey = signal('');
  readonly actionError = signal('');

  // ── Data (validated at the trust boundary with Zod) ──
  private readonly itemResource = resource({
    loader: async () => parseSocialMediaItem(await this.service.getById(this.itemId())),
  });

  readonly item = computed(() => this.itemResource.value() ?? null);
  readonly isLoading = computed(() => this.itemResource.isLoading());
  readonly hasError = computed(() => this.itemResource.status() === 'error');

  // ── Tabs: available platforms in canonical order; selection is derived so it
  // always lands on a real tab without effects. ──
  readonly availableTabs = computed<SocialMediaPlatformId[]>(() => {
    const posts = this.item()?.generatedPosts;
    if (!posts) return [];
    return this.platforms.map((p) => p.id).filter((id) => id in posts);
  });

  private readonly tabOverride = signal<SocialMediaPlatformId | null>(null);

  readonly activeTab = computed<SocialMediaPlatformId | null>(() => {
    const tabs = this.availableTabs();
    const override = this.tabOverride();
    if (override && tabs.includes(override)) return override;
    return tabs[0] ?? null;
  });

  readonly activePost = computed(() => {
    const item = this.item();
    const tab = this.activeTab();
    if (!item || !tab) return null;
    return item.generatedPosts[tab] ?? null;
  });

  readonly networksList = computed(() => {
    const nets = this.item()?.networks;
    if (!nets) return [];
    return Object.entries(nets)
      .filter(([, v]) => v)
      .map(([k]) => k);
  });

  readonly scoreColor = scoreColor;

  retry(): void {
    this.itemResource.reload();
  }

  setTab(tab: SocialMediaPlatformId): void {
    this.tabOverride.set(tab);
  }

  onTabKeydown(event: KeyboardEvent): void {
    const tabs = this.availableTabs();
    const current = this.activeTab();
    if (!current || tabs.length === 0) return;
    const idx = tabs.indexOf(current);
    let next = idx;
    switch (event.key) {
      case 'ArrowRight':
        next = (idx + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        next = (idx - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.setTab(tabs[next]);
    document.getElementById('tab-' + tabs[next])?.focus();
  }

  onBack(): void {
    this.router.navigate(['/social-media']);
  }

  onDelete(): void {
    if (!confirm('Are you sure you want to delete this content?')) return;
    this.actionError.set('');
    this.service
      .delete(this.itemId())
      .then(() => this.router.navigate(['/social-media']))
      .catch(() => this.actionError.set('Delete failed. Please try again.'));
  }

  async onDownloadZip(): Promise<void> {
    this.actionError.set('');
    this.downloading.set(true);
    try {
      const blob = await this.service.downloadZip(this.itemId());
      this.downloadBlob(blob, `social-media-${this.itemId()}.zip`);
    } catch {
      this.actionError.set('Download failed. Please try again.');
    } finally {
      this.downloading.set(false);
    }
  }

  copy(text: string, key: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.copiedKey.set(key);
        setTimeout(() => this.copiedKey.set(''), 2000);
      })
      .catch(() => this.actionError.set('Copy failed — your browser blocked clipboard access.'));
  }

  copyAll(post: GeneratedPost): void {
    const parts = [
      post.hook ?? '',
      post.body,
      post.hashtags.length ? post.hashtags.join(' ') : '',
    ]
      .map((s) => s.trim())
      .filter(Boolean);
    this.copy(parts.join('\n\n'), 'all');
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
