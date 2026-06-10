import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PostsFeatureService } from '../services/posts-feature.service';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import {
  AI_PROVIDERS,
  AiProvider,
  GOALS,
  GenerateSocialIdeasResponse,
  GenerateSocialPostResponse,
  PLATFORMS,
  PlatformId,
  SCORE_CONFIG,
  ScoreConfig,
  SocialIdea,
  VOICES,
  scoreToneClass,
} from '../models/posts.types';

type ScoreTab = 'scores' | 'seo' | 'eeat' | 'tips';

interface ScoreRow {
  config: ScoreConfig;
  value: number;
  passes: boolean;
  factors: string[];
  explanation: string;
}

@Component({
  selector: 'app-post-generator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, PageHeaderComponent, SidebarComponent],
  templateUrl: './post-generator.component.html',
  styleUrl: './post-generator.component.css',
})
export class PostGeneratorComponent {
  private service = inject(PostsFeatureService);

  // ── Static config exposed to the template ──
  readonly platforms = PLATFORMS;
  readonly goals = GOALS;
  readonly voices = VOICES;
  readonly providers = AI_PROVIDERS;
  readonly scoreConfig = SCORE_CONFIG;

  // Score ring geometry (single source for the SVG donut).
  readonly ringSize = 72;
  readonly ringRadius = 27;
  readonly ringCirc = 2 * Math.PI * 27;

  readonly drawerVisible = signal(false);

  // ── Wizard state ──
  readonly step = signal<1 | 2 | 3>(1);
  readonly loading = signal(false);
  readonly errorMsg = signal('');

  // Step 1 inputs
  readonly niche = signal('');
  readonly audience = signal('');
  readonly company = signal('');
  readonly goal = signal<string>('awareness');
  readonly voice = signal<string>('professional');
  readonly selectedPlatforms = signal<string[]>(['multi']);
  readonly provider = signal<AiProvider>('gemini');

  // Step 2/3 data
  readonly ideasData = signal<GenerateSocialIdeasResponse | null>(null);
  readonly selectedIdea = signal<SocialIdea | null>(null);
  readonly result = signal<GenerateSocialPostResponse | null>(null);

  // Result tabs
  readonly activeTab = signal<PlatformId>('blog');
  readonly scoreTab = signal<ScoreTab>('scores');
  readonly copiedKey = signal('');
  readonly downloading = signal(false);

  // ── Derived state ──
  readonly activeVariation = computed(() => {
    const r = this.result();
    return r ? r.platform_variations[this.activeTab()] : null;
  });

  readonly scoreRows = computed<ScoreRow[]>(() => {
    const r = this.result();
    if (!r) return [];
    return this.scoreConfig.map((config) => {
      const s = r.scores[config.key];
      return {
        config,
        value: s.value,
        passes: s.passes,
        factors: s.factors,
        explanation: s.explanation,
      };
    });
  });

  /** Overall publish-readiness banner driven by the critical Human Writing gate. */
  readonly publishStatus = computed<{ label: string; tone: string }>(() => {
    const r = this.result();
    if (!r) return { label: 'UNKNOWN', tone: 'score-warn' };
    const human = r.scores.human_writing_index.value;
    if (human < 75) return { label: 'BLOCKED', tone: 'score-bad' };
    return r.scores.summary.all_pass
      ? { label: 'READY', tone: 'score-good' }
      : { label: 'NEEDS REVIEW', tone: 'score-warn' };
  });

  readonly aiDetectionRisk = computed(() => this.result()?.scores.ai_detection_risk ?? null);

  // EEAT signal groups for the analysis tab.
  readonly eeatGroups = [
    { key: 'experience_signals', label: 'Experience', icon: '🧠' },
    { key: 'expertise_signals', label: 'Expertise', icon: '🎓' },
    { key: 'authoritativeness_signals', label: 'Authority', icon: '⭐' },
    { key: 'trustworthiness_signals', label: 'Trust', icon: '🛡️' },
  ] as const;

  eeatSignals(key: keyof GenerateSocialPostResponse['eeat_analysis']): string[] {
    return this.result()?.eeat_analysis[key] ?? [];
  }

  // ── Step 1 actions ──
  togglePlatform(id: string): void {
    if (id === 'multi') {
      this.selectedPlatforms.set(['multi']);
      return;
    }
    this.selectedPlatforms.update((current) => {
      const without = current.filter((p) => p !== 'multi');
      const next = without.includes(id)
        ? without.filter((p) => p !== id)
        : [...without, id];
      return next.length === 0 ? ['multi'] : next;
    });
  }

  isPlatformActive(id: string): boolean {
    return this.selectedPlatforms().includes(id);
  }

  async generateIdeas(): Promise<void> {
    if (!this.niche().trim()) {
      this.errorMsg.set('Enter your niche first.');
      return;
    }
    this.errorMsg.set('');
    this.loading.set(true);
    try {
      const data = await this.service.generateIdeas({
        niche: this.niche().trim(),
        audience: this.audience().trim() || undefined,
        platforms: this.selectedPlatforms(),
        goal: this.goal(),
        voice: this.voice(),
        company: this.company().trim() || undefined,
        provider: this.provider(),
      });
      this.ideasData.set(data);
      this.step.set(2);
    } catch {
      this.errorMsg.set('Failed to generate ideas. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  // ── Step 2 actions ──
  selectIdea(idea: SocialIdea): void {
    this.selectedIdea.set(idea);
  }

  isIdeaSelected(idea: SocialIdea): boolean {
    return this.selectedIdea()?.id === idea.id;
  }

  async generatePost(): Promise<void> {
    const idea = this.selectedIdea();
    if (!idea) {
      this.errorMsg.set('Select an idea first.');
      return;
    }
    this.errorMsg.set('');
    this.loading.set(true);
    try {
      const data = await this.service.generatePost({
        selectedIdea: idea,
        niche: this.niche().trim(),
        audience: this.audience().trim() || undefined,
        goal: this.goal(),
        voice: this.voice(),
        company: this.company().trim() || undefined,
        provider: this.provider(),
      });
      this.result.set(data);
      this.activeTab.set('blog');
      this.scoreTab.set('scores');
      this.step.set(3);
    } catch {
      this.errorMsg.set('Failed to generate the post. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  // ── Step 3 actions ──
  async copy(text: string, key: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copiedKey.set(key);
      setTimeout(() => this.copiedKey.set(''), 2000);
    } catch {
      this.errorMsg.set('Clipboard copy failed.');
    }
  }

  async downloadZip(): Promise<void> {
    const r = this.result();
    if (!r) return;
    this.downloading.set(true);
    try {
      const blob = await this.service.downloadSocialZip(r.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social-media-post-${r.id}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      this.errorMsg.set('Failed to download the ZIP package.');
    } finally {
      this.downloading.set(false);
    }
  }

  reset(): void {
    this.result.set(null);
    this.selectedIdea.set(null);
    this.errorMsg.set('');
    this.step.set(this.ideasData() ? 2 : 1);
  }

  goToStep(step: 1 | 2 | 3): void {
    this.step.set(step);
  }

  // ── Template helpers ──
  toneClass(value: number): string {
    return scoreToneClass(value);
  }

  dashOffset(value: number): number {
    return this.ringCirc - (Math.min(value, 100) / 100) * this.ringCirc;
  }

  schemaJson(): string {
    const r = this.result();
    return r ? JSON.stringify(r.seo_metadata.schema_json_ld, null, 2) : '';
  }

  variationCount(variation: { word_count: number | null; character_count: number | null }): string {
    if (variation.word_count != null) return `${variation.word_count} words`;
    if (variation.character_count != null) return `${variation.character_count} chars`;
    return '';
  }
}
