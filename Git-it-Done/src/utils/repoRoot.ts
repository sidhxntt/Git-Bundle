import { gitOutput } from './gitCommand.js';

/**
 * Absolute path of the repository root, or null when it cannot be resolved.
 * Used so staging operates on the same (repo-root-relative) set of paths that
 * the status display shows, no matter which subdirectory the tool was run from.
 */
export function getRepoRoot(): string | null {
  return gitOutput(['rev-parse', '--show-toplevel']);
}
