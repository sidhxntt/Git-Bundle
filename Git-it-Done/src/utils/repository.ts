import { existsSync } from 'fs';
import path from 'path';
import { getChanges } from './getFileChanges.js';
import { gitCommand, gitOutput } from './gitCommand.js';
import { GitChanges } from './types/types.js';

export type GitOperation = 'merge' | 'rebase' | 'am' | 'cherry-pick' | 'revert' | 'bisect';

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

const OPERATION_MARKERS = ['MERGE_HEAD', 'REBASE_HEAD', 'rebase-merge', 'rebase-apply', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'BISECT_LOG', 'applying'];

export function parseAheadBehind(output: string): AheadBehind | null {
  const [ahead, behind] = output.trim().split(/\s+/).map(Number);
  return Number.isInteger(ahead) && ahead >= 0 && Number.isInteger(behind) && behind >= 0
    ? { ahead, behind }
    : null;
}

export function parseConflictFiles(output: string): string[] {
  return output.split('\0').filter(Boolean);
}

export function detectOperation(entries: Set<string>): GitOperation | null {
  if (entries.has('MERGE_HEAD')) return 'merge';
  if (entries.has('REBASE_HEAD') || entries.has('rebase-merge')) return 'rebase';
  if (entries.has('rebase-apply')) return entries.has('applying') ? 'am' : 'rebase';
  if (entries.has('CHERRY_PICK_HEAD')) return 'cherry-pick';
  if (entries.has('REVERT_HEAD')) return 'revert';
  if (entries.has('BISECT_LOG')) return 'bisect';
  return null;
}

export function getInProgressOperation(gitDir: string | null): GitOperation | null {
  if (!gitDir) return null;
  const entries = new Set(OPERATION_MARKERS.filter(entry => existsSync(path.join(gitDir, entry))));
  if (existsSync(path.join(gitDir, 'rebase-apply', 'applying'))) entries.add('applying');
  return detectOperation(entries);
}

export function getRepositoryState(): RepositoryState {
  const branch = gitOutput(['branch', '--show-current']) || null;
  const remotes = (gitOutput(['remote']) ?? '').split('\n').filter(Boolean);
  const upstream = gitOutput(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  // With HEAD on the left, Git emits local-only commits (ahead) first and
  // upstream-only commits (behind) second.
  const counts = upstream ? gitOutput(['rev-list', '--left-right', '--count', `HEAD...${upstream}`]) : null;
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
