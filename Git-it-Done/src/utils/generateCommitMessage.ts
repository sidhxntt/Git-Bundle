import path from 'path';
import chalk from 'chalk';
import { DiffSignals, readStagedDiffSignals } from './diffSignals.js';
import { CommitType, FileChange } from './types/types.js';

export type FileCategory = 'deps' | 'test' | 'docs' | 'config' | 'style' | 'source';

/** Checked in this order, so the more specific category always wins a tie. */
const CATEGORY_ORDER: FileCategory[] = ['deps', 'test', 'docs', 'config', 'style', 'source'];

const DEPS_FILE =
  /^(package(-lock)?\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|requirements(-[\w.]+)?\.txt|Pipfile(\.lock)?|poetry\.lock|Gemfile(\.lock)?|go\.(mod|sum)|Cargo\.(toml|lock)|composer\.(json|lock))$/i;

const TEST_DIR = /(^|\/)(tests?|__tests__|__mocks__|spec|e2e|cypress)\//i;
const TEST_FILE = /(\.(test|spec)\.[cm]?[jt]sx?|_test\.(go|py|rb)|^test_[^/]+\.py)$/i;

const DOCS_DIR = /(^|\/)docs?\//i;
const DOCS_FILE = /(\.(md|mdx|rst|adoc)|^(readme|changelog|contributing|authors|license)(\.[a-z]+)?)$/i;

const STYLE_FILE = /\.(css|scss|sass|less|styl)$/i;

/** Real configuration files — not "anything ending in .json". */
const CONFIG_FILE =
  /^(tsconfig(\.[\w-]+)?\.json|jsconfig\.json|\.editorconfig|\.gitignore|\.gitattributes|\.npmrc|\.npmignore|\.nvmrc|\.node-version|\.eslintrc(\.[\w-]+)?|\.eslintignore|\.prettierrc(\.[\w-]+)?|\.prettierignore|\.babelrc(\.[\w-]+)?|\.dockerignore|\.env(\.[\w-]+)?|Dockerfile(\.[\w-]+)?|docker-compose(\.[\w-]+)?\.ya?ml|Makefile|renovate\.json|netlify\.toml|vercel\.json)$/i;
const CONFIG_SUFFIX = /\.config\.([cm]?[jt]s|json|ya?ml|toml)$/i;
const CONFIG_DIR = /^\.(github|circleci|vscode|husky|idea)\//i;

/** Monorepo container directories whose child directory is the useful scope. */
const CONTAINER_DIRS = new Set(['packages', 'apps', 'libs', 'services', 'crates', 'modules']);

export function categorizeFile(file: string): FileCategory {
  const base = file.split('/').pop() ?? file;

  if (DEPS_FILE.test(base)) return 'deps';
  if (TEST_DIR.test(file) || TEST_FILE.test(base)) return 'test';
  if (DOCS_DIR.test(file) || DOCS_FILE.test(base)) return 'docs';
  if (CONFIG_FILE.test(base) || CONFIG_SUFFIX.test(base) || CONFIG_DIR.test(file)) return 'config';
  if (STYLE_FILE.test(base)) return 'style';
  return 'source';
}

/** The category the majority of the changed files belong to. */
export function dominantCategory(files: FileChange[]): FileCategory {
  const counts = new Map<FileCategory, number>();
  for (const { file } of files) {
    const category = categorizeFile(file);
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  let winner: FileCategory = 'source';
  let best = 0;
  for (const category of CATEGORY_ORDER) {
    const count = counts.get(category) ?? 0;
    if (count > best) {
      winner = category;
      best = count;
    }
  }
  return winner;
}

/**
 * Most common directory across the changed files. `packages/x/...` and
 * `apps/x/...` resolve to `x` so a monorepo commit is not scoped `packages`.
 */
export function deriveScope(files: FileChange[]): string {
  const counts = new Map<string, number>();

  for (const { file } of files) {
    const segments = file.split('/').filter(Boolean);
    if (segments.length < 2) continue;

    let scope = segments[0];
    if (CONTAINER_DIRS.has(scope.toLowerCase()) && segments.length > 2) {
      scope = segments[1];
    }
    scope = scope.replace(/[()\s]/g, '');
    if (!scope) continue;

    counts.set(scope, (counts.get(scope) ?? 0) + 1);
  }

  let winner = '';
  let best = 0;
  for (const [scope, count] of counts) {
    if (count > best) {
      winner = scope;
      best = count;
    }
  }
  return winner;
}

interface Operations {
  added: number;
  modified: number;
  deleted: number;
  renamed: number;
}

function countOperations(files: FileChange[]): Operations {
  const operations: Operations = { added: 0, modified: 0, deleted: 0, renamed: 0 };
  for (const { status } of files) {
    switch (status) {
      case 'A':
      case '??':
        operations.added++;
        break;
      case 'M':
      case 'T':
        operations.modified++;
        break;
      case 'D':
        operations.deleted++;
        break;
      case 'R':
      case 'C':
        operations.renamed++;
        break;
    }
  }
  return operations;
}

function firstNameWithStatus(files: FileChange[], statuses: string[]): string {
  const match = files.find(file => statuses.includes(file.status));
  return match ? path.basename(match.file) : '';
}

interface Classification {
  type: CommitType;
  description: string;
}

function classifySource(files: FileChange[], operations: Operations): Classification {
  const { added, modified, deleted, renamed } = operations;

  if (added > 0 && modified === 0 && deleted === 0 && renamed === 0) {
    return {
      type: 'feat',
      description: added === 1 ? `add ${firstNameWithStatus(files, ['A', '??'])}` : `add ${added} new files`
    };
  }

  if (deleted > 0 && added === 0 && modified === 0 && renamed === 0) {
    return {
      type: 'refactor',
      description:
        deleted === 1 ? `remove ${firstNameWithStatus(files, ['D'])}` : `remove ${deleted} files`
    };
  }

  if (renamed > 0 && added === 0 && modified === 0 && deleted === 0) {
    return {
      type: 'refactor',
      description:
        renamed === 1 ? `rename ${firstNameWithStatus(files, ['R', 'C'])}` : `rename ${renamed} files`
    };
  }

  if (added > 0 && added >= modified + deleted + renamed) {
    return { type: 'feat', description: 'add new functionality' };
  }

  if (modified === 1 && added === 0 && deleted === 0 && renamed === 0) {
    return { type: 'chore', description: `update ${firstNameWithStatus(files, ['M', 'T'])}` };
  }

  return { type: 'chore', description: 'update and improve code' };
}

function classifyByCategory(
  category: FileCategory,
  files: FileChange[],
  operations: Operations
): Classification {
  switch (category) {
    case 'deps':
      // `deps` is not a Conventional Commits type; dependency bumps are `build`.
      return { type: 'build', description: 'update dependencies' };
    case 'test':
      return {
        type: 'test',
        description: operations.modified === 0 && operations.added > 0 ? 'add tests' : 'update tests'
      };
    case 'docs':
      return { type: 'docs', description: 'update documentation' };
    case 'config':
      // `config` is not a Conventional Commits type either.
      return { type: 'chore', description: 'update configuration' };
    case 'style':
      return { type: 'style', description: 'update styles' };
    default:
      return classifySource(files, operations);
  }
}

/**
 * Diff hints only ever break a tie: they refine the vague `chore: update ...`
 * fallback and are never allowed to override a confident classification such as
 * "40 files were added" or "this commit only touches docs".
 */
function refine(base: Classification, signals: DiffSignals | null): Classification {
  if (!signals || signals.oversized || base.type !== 'chore') {
    return base;
  }

  if (signals.fixIntent) {
    return { type: 'fix', description: 'correct faulty behavior' };
  }
  if (signals.newApi) {
    return { type: 'feat', description: 'implement new functionality' };
  }
  if (signals.refactorIntent) {
    return { type: 'refactor', description: 'restructure code' };
  }
  if (signals.conditionalChurn) {
    return { type: 'fix', description: 'correct conditional handling' };
  }

  return base;
}

/** Pure, testable core: no git access, all inputs explicit. */
export function buildCommitMessage(files: FileChange[], signals: DiffSignals | null = null): string {
  const operations = countOperations(files);
  const category = dominantCategory(files);

  const base = classifyByCategory(category, files, operations);
  const { type, description } = category === 'source' ? refine(base, signals) : base;

  // Renames-only commits used to produce an empty description ("chore(src): ").
  const safeDescription = description.trim() || 'update files';
  const scope = deriveScope(files);
  const scopeStr = scope ? `(${scope})` : '';

  return `${type}${scopeStr}: ${safeDescription}`;
}

export function generateCommitMessage(files: FileChange[]): string {
  const signals = readStagedDiffSignals();

  if (signals?.oversized) {
    console.log(
      chalk.yellow(
        '⚠️  Staged diff is too large to analyse — the message is based on file names only.'
      )
    );
  }

  return buildCommitMessage(files, signals);
}
