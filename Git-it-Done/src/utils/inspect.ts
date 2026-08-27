import chalk from 'chalk';
import { getRepositoryState, hasLocalChanges } from './repository.js';
import { gitOutput } from './gitCommand.js';

export function showRepositorySummary(): void {
  const state = getRepositoryState();
  const fileCount = state.changes.staged.length + state.changes.unstaged.length + state.changes.untracked.length;
  console.log(chalk.bold('\nRepository overview'));
  console.log(`  Branch: ${chalk.cyan(state.branch ?? 'detached HEAD')}`);
  console.log(`  Working tree: ${hasLocalChanges(state.changes) ? chalk.yellow(`${fileCount} changed file(s)`) : chalk.green('clean')}`);
  console.log(`  Remote: ${state.upstream ?? (state.remotes[0] ? `${state.remotes[0]} (no upstream)` : 'none configured')}`);
  if (state.aheadBehind) console.log(`  Sync: ${state.aheadBehind.ahead} ahead, ${state.aheadBehind.behind} behind`);
  if (state.operation) console.log(chalk.yellow(`  Attention: ${state.operation} is in progress${state.conflicts.length ? ` (${state.conflicts.length} conflict(s))` : ''}`));
}

export function inspectRepository(): void {
  const state = getRepositoryState();
  showRepositorySummary();
  const recent = gitOutput(['log', '-5', '--oneline']) ?? '';
  if (recent) console.log(`\n${chalk.bold('Recent commits')}\n${recent}`);
  const remotes = gitOutput(['remote', '-v']) ?? '';
  if (remotes) console.log(`\n${chalk.bold('Remotes')}\n${remotes}`);
  if (state.conflicts.length) console.log(chalk.red(`\nConflicted files:\n${state.conflicts.map(file => `  • ${file}`).join('\n')}`));
}
