import { AheadBehind } from './repository.js';

export type SyncRecommendation = 'up-to-date' | 'push' | 'pull' | 'inspect';

export function validateBranchName(name: string): string | undefined {
  const value = name.trim();
  if (!value) return 'Branch name is required';
  if (value.startsWith('-')) return 'Branch names cannot start with a dash';
  if (/\s/.test(value)) return 'Branch names cannot contain spaces';
  if (value.includes('..')) return 'Branch names cannot contain consecutive dots';
  if (/[@~^:?*\\[\x00-\x1f]/.test(value) || value.endsWith('.') || value.endsWith('/')) {
    return 'Use a valid Git branch name';
  }
  return undefined;
}

export function syncRecommendation(counts: AheadBehind): SyncRecommendation {
  if (counts.ahead === 0 && counts.behind === 0) return 'up-to-date';
  if (counts.ahead > 0 && counts.behind === 0) return 'push';
  if (counts.ahead === 0 && counts.behind > 0) return 'pull';
  return 'inspect';
}
