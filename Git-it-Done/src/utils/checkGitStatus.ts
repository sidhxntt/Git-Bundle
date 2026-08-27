import { existsSync } from 'fs';
import path from 'path';
import { gitCommand, gitOutput } from './gitCommand.js';
import { GitStatus } from './types/types.js';

/** In-progress operations we refuse to commit into. */
const IN_PROGRESS: Array<{ entry: string; reason: string }> = [
  { entry: 'MERGE_HEAD', reason: 'A merge is in progress' },
  { entry: 'REBASE_HEAD', reason: 'A rebase is in progress' },
  { entry: 'rebase-merge', reason: 'A rebase is in progress' },
  { entry: 'rebase-apply', reason: 'A rebase or `git am` is in progress' },
  { entry: 'CHERRY_PICK_HEAD', reason: 'A cherry-pick is in progress' },
  { entry: 'REVERT_HEAD', reason: 'A revert is in progress' },
  { entry: 'BISECT_LOG', reason: 'A bisect session is in progress' }
];

export function checkGitStatus(): GitStatus {
  const warnings: string[] = [];

  // Step 1: Check if Git is installed
  if (!gitCommand(['--version']).ok) {
    return { valid: false, reason: 'Git is not installed or not in PATH' };
  }

  // Step 2: Check if inside a Git repository
  const gitDir = gitOutput(['rev-parse', '--absolute-git-dir']);
  if (!gitDir) {
    return { valid: false, reason: 'Not in a Git repository' };
  }

  // An in-progress operation is recoverable from the workspace conflict UI.
  for (const { entry, reason } of IN_PROGRESS) {
    if (existsSync(path.join(gitDir, entry))) {
      warnings.push(`${reason}. Select “Resolve in-progress operation” for guided recovery.`);
      break;
    }
  }

  // Step 4: Warn loudly about a detached HEAD (commits there are easy to lose)
  if (!gitCommand(['symbolic-ref', '--quiet', 'HEAD']).ok) {
    const head = gitOutput(['rev-parse', '--short', 'HEAD']) ?? 'unknown';
    warnings.push(
      `HEAD is detached at ${head} — commits made here are not on any branch and can be lost. Run \`git switch -c <branch>\` first.`
    );
  }

  // Step 5: Check if Git user config is set
  const userName = gitOutput(['config', 'user.name']);
  const userEmail = gitOutput(['config', 'user.email']);

  if (!userName || !userEmail) {
    return {
      valid: false,
      reason: `Git user not configured. Run:\n  git config --global user.name "Your Name"\n  git config --global user.email "you@example.com"`
    };
  }

  return warnings.length > 0 ? { valid: true, warnings } : { valid: true };
}
