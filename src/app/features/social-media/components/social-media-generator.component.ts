import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { SocialMediaFeatureService } from '../services/social-media-feature.service';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { PLATFORMS, SocialMediaTopicResponse } from '../models/social-media.types';

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-social-media-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PageHeaderComponent, SidebarComponent],
  templateUrl: './social-media-generator.component.html',
  styleUrl: './social-media-generator.component.css',
})
export class SocialMediaGeneratorComponent {
  private service = inject(SocialMediaFeatureService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);

  // ── Static config ──
  readonly platforms = PLATFORMS;

  readonly drawerVisible = signal(false);

  // ── Wizard state ──
  readonly step = signal<Step>(1);
  readonly loading = signal(false);
  readonly errorMsg = signal('');

  // Step 1 form — only fields the backend actually consumes
  // (niche + language). Platform selection is a chip group below.
  readonly form = this.fb.group({
    niche: ['', [Validators.required, Validators.minLength(2)]],
    language: [''],
  });

  readonly selectedPlatforms = signal<string[]>(['multi']);

  // Step 2/3 data
  readonly topicsData = signal<SocialMediaTopicResponse[] | null>(null);
  readonly selectedTopic = signal<SocialMediaTopicResponse | null>(null);
  readonly jobResult = signal<{ jobId: string; status: string } | null>(null);

  // ── Derived state ──
  readonly hasTopics = computed(() => (this.topicsData()?.length ?? 0) > 0);

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

  async findTopics(): Promise<void> {
    const nicheCtrl = this.form.controls.niche;
    if (nicheCtrl.invalid) {
      nicheCtrl.markAsTouched();
      this.errorMsg.set('Enter your niche first.');
      return;
    }
    this.errorMsg.set('');
    this.loading.set(true);
    try {
      const { niche, language } = this.form.getRawValue();
      const data = await this.service.findTopics({
        niche: niche.trim(),
        language: language.trim() || undefined,
        maxTopics: 10,
      });
      this.topicsData.set(data);
      this.step.set(2);
    } catch {
      this.errorMsg.set('Failed to generate topics. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  // ── Step 2 actions ──
  selectTopic(topic: SocialMediaTopicResponse): void {
    this.selectedTopic.set(topic);
  }

  isTopicSelected(topic: SocialMediaTopicResponse): boolean {
    return this.selectedTopic()?.id === topic.id;
  }

  async generateContent(): Promise<void> {
    const topic = this.selectedTopic();
    if (!topic) {
      this.errorMsg.set('Select a topic first.');
      return;
    }
    this.errorMsg.set('');
    this.loading.set(true);
    try {
      const networks: Record<string, boolean> = {};
      const selected = this.selectedPlatforms();
      if (selected.includes('multi')) {
        this.platforms.forEach((p) => (networks[p.id] = true));
      } else {
        this.platforms.forEach((p) => (networks[p.id] = selected.includes(p.id)));
      }

      const language = this.form.getRawValue().language.trim() || undefined;
      const result = await this.service.generateContent({
        topic: { title: topic.title, description: topic.description },
        networks,
        language,
        saveToHistory: true,
        topicId: topic.id,
      });
      this.jobResult.set(result);
      this.step.set(3);
    } catch {
      this.errorMsg.set('Failed to queue content generation. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  goToStep(s: Step): void {
    this.step.set(s);
    this.errorMsg.set('');
  }

  onViewHistory(): void {
    this.router.navigate(['/social-media']);
  }

  onGenerateMore(): void {
    this.step.set(1);
    this.topicsData.set(null);
    this.selectedTopic.set(null);
    this.jobResult.set(null);
    this.selectedPlatforms.set(['multi']);
    this.errorMsg.set('');
  }
}
