#!/usr/bin/env node
/**
 * ai-config-sync
 * ------------------------------------------------------------------
 * Keeps the AI assistant configuration (.claude/, CLAUDE.md, AGENTS.md)
 * consistent with the ACTUAL codebase, and mirrors the canonical rules
 * into .devin/ so Claude and Devin share one source of truth.
 *
 * Ground truth is derived from code — NOT from the docs:
 *   - package.json          -> deps, test runner, Angular/PrimeNG versions
 *   - src/app/app.config.ts  -> styled vs unstyled, darkModeSelector, zoneless, theme import
 *   - src/app/ folder tree   -> real project structure
 *
 * Usage:
 *   npm run ai:config-sync            # check drift + regenerate .devin/ (exit 1 if drift)
 *   npm run ai:config-sync -- --check # check only, never write (CI / pre-commit gate)
 *
 * No external dependencies — runs on plain Node.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');

const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const exists = (rel) => existsSync(join(ROOT, rel));

// ------------------------------------------------------------------
// 1. Ground truth — derived from the real code
// ------------------------------------------------------------------
function detectFacts() {
  const pkg = JSON.parse(read('package.json'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const appConfig = exists('src/app/app.config.ts') ? read('src/app/app.config.ts') : '';

  const darkMatch = appConfig.match(/darkModeSelector\s*:\s*['"]([^'"]+)['"]/);

  return {
    angular: deps['@angular/core'] ?? 'unknown',
    primeng: deps['primeng'] ?? 'absent',
    primeuixThemes: Boolean(deps['@primeuix/themes']),
    tailwind: Boolean(deps['tailwindcss']),
    testRunner: deps['vitest']
      ? 'vitest'
      : (deps['@playwright/test'] || deps['playwright'])
        ? 'playwright'
        : 'unknown',
    hasZod: Boolean(deps['zod']),
    hasDompurify: Boolean(deps['dompurify']),
    zoneless: /provideZonelessChangeDetection\s*\(/.test(appConfig),
    unstyled: /unstyled\s*:\s*true/.test(appConfig),
    primengStyled: appConfig.length > 0 && !/unstyled\s*:\s*true/.test(appConfig) && /preset\s*:/.test(appConfig),
    themeImportCorrect: /@primeuix\/themes\/aura/.test(appConfig),
    darkModeSelector: darkMatch ? darkMatch[1] : null,
    ssr: Boolean(deps['@angular/ssr']),
  };
}

// ------------------------------------------------------------------
// 2. Collect AI doc files (the things that drift)
// ------------------------------------------------------------------
function collectDocs() {
  const docs = [];
  const SKIP = new Set(['node_modules', '.git', '.devin', 'dist', '.angular']);

  function walk(absDir) {
    for (const entry of readdirSync(absDir)) {
      if (SKIP.has(entry)) continue;
      const abs = join(absDir, entry);
      const st = statSync(abs);
      if (st.isDirectory()) walk(abs);
      else if (entry.endsWith('.md')) docs.push(abs);
    }
  }

  if (exists('.claude')) walk(join(ROOT, '.claude'));
  for (const f of ['CLAUDE.md', 'AGENTS.md']) if (exists(f)) docs.push(join(ROOT, f));
  return docs;
}

// ------------------------------------------------------------------
// 3. Drift rules — a doc line "violates" if it matches `bad`
//    and does NOT match `allow` (negation / prohibition markers)
// ------------------------------------------------------------------
function buildRules(facts) {
  const rules = [];
  // A line is exempt from a rule if it is clearly a prohibition / correct-usage
  // assertion rather than a real recommendation of the bad pattern.
  const NEG = /not used|not installed|no longer|never\b|❌|✅|\bNOT\b|\bno\b|wrong path|wrong\b|isn'?t used|deprecated|legacy|styled mode/i;

  if (facts.testRunner === 'vitest') {
    rules.push({
      id: 'test-runner',
      bad: /playwright/i,
      allow: NEG,
      msg: `Test runner is "vitest" but a doc still recommends Playwright.`,
    });
  }

  if (facts.primengStyled) {
    rules.push({
      id: 'primeng-mode',
      bad: /unstyled\s*:\s*true/i,
      allow: NEG,
      msg: `PrimeNG runs in styled mode but a doc still shows "unstyled: true".`,
    });
    rules.push({
      id: 'theme-import',
      bad: /from\s+['"]primeng\/themes['"]/,
      allow: NEG,
      msg: `Aura preset must come from "@primeuix/themes/aura"; a doc uses the wrong "primeng/themes" path.`,
    });
  }

  // standalone: true is always redundant in v21
  rules.push({
    id: 'standalone',
    bad: /standalone\s*:\s*true/,
    allow: /never|no [`']?standalone|v21 default|redundant|NOT|❌/i,
    msg: `"standalone: true" appears in a code sample (redundant/forbidden in Angular v21).`,
  });

  return rules;
}

function scanDrift(docs, facts) {
  const rules = buildRules(facts);
  const findings = [];

  for (const abs of docs) {
    const rel = relative(ROOT, abs).split(sep).join('/');
    const lines = read(relative(ROOT, abs)).split(/\r?\n/);

    lines.forEach((line, i) => {
      for (const rule of rules) {
        if (rule.bad.test(line) && !rule.allow.test(line)) {
          findings.push({ rule: rule.id, msg: rule.msg, file: rel, line: i + 1, text: line.trim() });
        }
      }

      // Special case: darkModeSelector value must match the real one
      if (facts.darkModeSelector) {
        const m = line.match(/darkModeSelector\s*:\s*['"]([^'"]+)['"]/);
        if (m && m[1] !== facts.darkModeSelector && !NEG_LINE.test(line)) {
          findings.push({
            rule: 'dark-selector',
            msg: `darkModeSelector should be '${facts.darkModeSelector}' (matches ThemeService), but a doc shows '${m[1]}'.`,
            file: rel,
            line: i + 1,
            text: line.trim(),
          });
        }
      }
    });
  }
  return findings;
}
const NEG_LINE = /not used|❌|NOT\b|wrong/i;

// ------------------------------------------------------------------
// 4. Sync canonical rules + facts into .devin/
// ------------------------------------------------------------------
function factsMarkdown(facts) {
  const yn = (b) => (b ? 'yes' : 'no');
  return [
    '## Project ground truth (auto-detected from code)',
    '',
    '> Generated by `npm run ai:config-sync` — do not edit by hand.',
    '',
    `- **Angular:** ${facts.angular} (${facts.zoneless ? 'zoneless' : 'zone-based'} change detection)`,
    `- **PrimeNG:** ${facts.primeng} — ${facts.primengStyled ? 'styled theming via @primeuix/themes' : 'NOT styled (check config)'}`,
    `- **@primeuix/themes installed:** ${yn(facts.primeuixThemes)} | **theme import correct:** ${yn(facts.themeImportCorrect)}`,
    `- **darkModeSelector:** ${facts.darkModeSelector ?? 'unknown'} (dark = \`.dark\`, light = \`[data-theme="light"]\`)`,
    `- **Tailwind v4:** ${yn(facts.tailwind)} | **SSR (@angular/ssr):** ${yn(facts.ssr)}`,
    `- **Test runner:** ${facts.testRunner}`,
    `- **Zod installed:** ${yn(facts.hasZod)} | **DOMPurify installed:** ${yn(facts.hasDompurify)}`,
    '',
  ].join('\n');
}

function syncDevin(facts) {
  const written = [];
  const devinDir = join(ROOT, '.devin');
  mkdirSync(devinDir, { recursive: true });

  const banner =
    '<!-- GENERATED by `npm run ai:config-sync` from .claude/ + the codebase. DO NOT EDIT. -->\n\n';

  // Canonical always-on rules, mirrored so Devin shares them with Claude.
  const ruleFiles = ['.claude/rules/angular-rules.md', '.claude/rules/styles.md'];
  const inlined = ruleFiles
    .filter((f) => exists(f))
    .map((f) => `\n\n---\n\n# Source: ${f}\n\n${read(f).replace(/^---\n[\s\S]*?\n---\n/, '')}`)
    .join('\n');

  const aiRules =
    banner +
    '# AI Rules (Devin) — synced from .claude\n\n' +
    factsMarkdown(facts) +
    '\nThese rules are the same ones Claude Code uses. Edit them in `.claude/rules/` and re-run `npm run ai:config-sync`.\n' +
    inlined +
    '\n';

  writeFileSync(join(devinDir, 'ai-rules.md'), aiRules);
  written.push('.devin/ai-rules.md');

  writeFileSync(join(devinDir, 'project-facts.json'), JSON.stringify(facts, null, 2) + '\n');
  written.push('.devin/project-facts.json');

  const readme =
    banner +
    '# .devin\n\n' +
    'AI assistant configuration for Devin, kept in sync with `.claude/` by `npm run ai:config-sync`.\n\n' +
    '- `ai-rules.md` — the canonical always-on rules (mirror of `.claude/rules/`) + auto-detected project facts.\n' +
    '- `project-facts.json` — machine-readable ground truth.\n\n' +
    '**Do not edit these files directly** — edit `.claude/rules/` and re-run the sync.\n';
  writeFileSync(join(devinDir, 'README.md'), readme);
  written.push('.devin/README.md');

  return written;
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
function main() {
  console.log(c.bold('\nai-config-sync') + c.dim(` (${CHECK_ONLY ? 'check only' : 'check + sync'})\n`));

  const facts = detectFacts();
  console.log(c.cyan('Ground truth:'));
  console.log(factsMarkdown(facts).split('\n').filter((l) => l.startsWith('- ')).join('\n'));
  console.log('');

  const docs = collectDocs();
  const findings = scanDrift(docs, facts);

  if (findings.length === 0) {
    console.log(c.green(`✔ No drift across ${docs.length} AI doc file(s).`));
  } else {
    console.log(c.red(`✖ ${findings.length} drift issue(s) found:`));
    for (const f of findings) {
      console.log(`  ${c.red('•')} ${c.bold(f.file + ':' + f.line)} ${c.dim('[' + f.rule + ']')}`);
      console.log(`    ${f.msg}`);
      console.log(`    ${c.dim(f.text)}`);
    }
  }

  if (!CHECK_ONLY) {
    const written = syncDevin(facts);
    console.log('\n' + c.green('✔ Synced .devin/:'));
    for (const w of written) console.log('  ' + c.dim('→ ') + w);
  } else {
    console.log(c.dim('\n(--check: skipped writing .devin/)'));
  }

  console.log('');
  if (findings.length > 0) {
    console.log(c.red('Drift detected — update the docs in .claude/ (or the code) and re-run.'));
    process.exit(1);
  }
}

main();
