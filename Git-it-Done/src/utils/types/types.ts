export interface FileChange {
  /** Single-letter git status: A, M, D, R, C, T, U or `??` for untracked. */
  status: string;
  /** Repo-root-relative path. For renames/copies this is the destination. */
  file: string;
  /** Source path, present only for renames and copies. */
  from?: string;
}

export interface GitChanges {
  staged: FileChange[];
  unstaged: FileChange[];
  untracked: FileChange[];
}

export interface GitStatus {
  valid: boolean;
  reason?: string;
  /** Non-fatal problems worth shouting about (e.g. detached HEAD). */
  warnings?: string[];
}

/**
 * Conventional Commits types only — anything outside this list is rejected by a
 * standard commitlint `commit-msg` hook.
 */
export type CommitType =
  | 'feat'
  | 'fix'
  | 'docs'
  | 'style'
  | 'refactor'
  | 'perf'
  | 'test'
  | 'build'
  | 'ci'
  | 'chore'
  | 'revert';

export interface CommitInfo {
  type: CommitType;
  scope?: string;
  description: string;
}
