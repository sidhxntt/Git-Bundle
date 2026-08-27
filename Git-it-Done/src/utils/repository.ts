import { existsSync } from 'fs';
import path from 'path';
import { getChanges } from './getFileChanges.js';
import { gitCommand, gitOutput } from './gitCommand.js';
import { GitChanges } from './types/types.js';

export type GitOperation = 'merge' | 'rebase' | 'cherry-pick' | 'revert' | 'bisect';

export interface AheadBehind {
  ahead: number;
  behind: number;
}

export interface RepositoryState {
  branch: string | null;
  remotes: string[];
  upstream: string | null;
  aheadBehind: AheadBehind | null;
  operation: GitOperation | null;
  conflicts: string[];
  changes: GitChanges;
}

const OPERATION_MARKERS: Array<{ operation: GitOperation; entries: string[] }> = [
  { operation: 'merge', entries: ['MERGE_HEAD'] },
  { operation: 'rebase', entries: ['REBASE_HEAD', 'rebase-merge', 'rebase-apply'] },
  { operation: 'cherry-pick', entries: ['CHERRY_PICK_HEAD'] },
  { operation: 'revert', entries: ['REVERT_HEAD'] },
  { operation: 'bisect', entries: ['BISECT_LOG'] }
];

export function parseAheadBehind(output: string): AheadBehind | null {
  const [ahead, behind] = output.trim().split(/\s+/).map(Number);
  return Number.isInteger(ahead) && ahead >= 0 && Number.isInteger(behind) && behind >= 0
    ? { ahead, behind }
    : null;
}

export function parseConflictFiles(output: string): string[] {
  return output.split('\0').filter(Boolean);
}

export function getInProgressOperation(gitDir: string | null): GitOperation | null {
  if (!gitDir) return null;
  for (const { operation, entries } of OPERATION_MARKERS) {
    if (entries.some(entry => existsSync(path.join(gitDir, entry)))) return operation;
  }
  return null;
}

export function getRepositoryState(): RepositoryState {
  const branch = gitOutput(['branch', '--show-current']) || null;
  const remotes = (gitOutput(['remote']) ?? '').split('\n').filter(Boolean);
  const upstream = gitOutput(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const counts = upstream ? gitOutput(['rev-list', '--left-right', '--count', `${upstream}...HEAD`]) : null;
  const conflicts = gitCommand(['diff', '--name-only', '--diff-filter=U', '-z']);

  return {
    branch,
    remotes,
    upstream,
    aheadBehind: counts ? parseAheadBehind(counts) : null,
    operation: getInProgressOperation(gitOutput(['rev-parse', '--absolute-git-dir'])),
    conflicts: conflicts.ok ? parseConflictFiles(conflicts.stdout) : [],
    changes: getChanges()
  };
}

export function hasLocalChanges(changes: GitChanges): boolean {
  return changes.staged.length + changes.unstaged.length + changes.untracked.length > 0;
}
