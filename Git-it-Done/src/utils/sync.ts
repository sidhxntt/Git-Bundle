import { confirm, isCancel, spinner } from '@clack/prompts';
import chalk from 'chalk';
import { gitCommand, gitErrorText } from './gitCommand.js';
import { getRepositoryState, hasLocalChanges } from './repository.js';
import { syncRecommendation } from './validation.js';
import { handlePushToRemote } from './push_to_remote.js';

export function buildPullArgs(): string[] { return ['pull', '--ff-only']; }
export function buildPushArgs(upstream: string | null, remote?: string, branch?: string): string[] {
  return upstream ? ['push'] : ['push', '--set-upstream', remote ?? 'origin', branch ?? 'HEAD'];
}

export async function syncWithRemote(): Promise<void> {
  const before = getRepositoryState();
  if (!before.remotes.length) return void console.log(chalk.yellow('No remote is configured. Add one before syncing.'));
  const s = spinner(); s.start('Fetching remote updates…');
  const fetched = gitCommand(['fetch', '--prune']);
  if (!fetched.ok) { s.stop('Fetch failed'); console.log(chalk.red(gitErrorText(fetched))); return; }
  s.stop('Remote state refreshed');
  const state = getRepositoryState();
  if (!state.upstream || !state.aheadBehind) { console.log(chalk.yellow('This branch has no upstream. Use “Push current branch” to publish it.')); return; }
  const recommendation = syncRecommendation(state.aheadBehind);
  if (recommendation === 'up-to-date') return void console.log(chalk.green('Already up to date.'));
  if (recommendation === 'inspect') return void console.log(chalk.yellow(`This branch has diverged (${state.aheadBehind.ahead} ahead, ${state.aheadBehind.behind} behind). Inspect and resolve it with Git before syncing.`));
  if (recommendation === 'push') return void (await handlePushToRemote());
  if (hasLocalChanges(state.changes)) return void console.log(chalk.yellow('Your working tree has changes. Commit or stash them before pulling to avoid overwriting work.'));
  const confirmed = await confirm({ message: `Pull ${state.upstream} with fast-forward only?` });
  if (isCancel(confirmed) || !confirmed) return;
  const pulled = gitCommand(buildPullArgs());
  console.log(pulled.ok ? chalk.green('Pulled successfully.') : chalk.red(`Pull failed:\n${gitErrorText(pulled)}`));
}
