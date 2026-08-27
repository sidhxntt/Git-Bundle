import { isCancel, select } from '@clack/prompts';
import chalk from 'chalk';
import { manageBranches } from './branches.js';
import { runCommitWorkflow } from './commitWorkflow.js';
import { handleInProgressOperation } from './conflicts.js';
import { showHelp } from './help.js';
import { inspectRepository, showRepositorySummary } from './inspect.js';
import { getRepositoryState } from './repository.js';
import { manageStash } from './stash.js';
import { syncWithRemote } from './sync.js';
import { handlePushToRemote } from './push_to_remote.js';

export async function runWorkspace(): Promise<void> {
  let active = true;
  while (active) {
    showRepositorySummary();
    const state = getRepositoryState();
    const options = state.operation ? [
      { value: 'conflicts', label: `Resolve ${state.operation} in progress`, hint: state.conflicts.length ? `${state.conflicts.length} unresolved file(s)` : 'review or finish safely' },
      { value: 'inspect', label: 'Inspect repository', hint: 'Status, recent commits, remotes, and conflicts' },
      { value: 'help', label: 'Help and native Git equivalents', hint: 'Learn the Git command behind each action' },
      { value: 'exit', label: 'Exit' }
    ] : [
      { value: 'commit', label: 'Commit changes', hint: 'Stage files, write a message, and optionally push' },
      { value: 'sync', label: 'Sync with remote', hint: 'Fetch first, then safely pull or push' },
      { value: 'push', label: 'Push current branch', hint: 'Publish commits with branch protection warnings' },
      { value: 'branches', label: 'Manage branches', hint: 'List, switch, or create a branch' },
      { value: 'stash', label: 'Save or restore work', hint: 'Stash current work and restore it later' },
      { value: 'inspect', label: 'Inspect repository', hint: 'Status, recent commits, remotes, and conflicts' },
      { value: 'help', label: 'Help and native Git equivalents', hint: 'Learn the Git command behind each action' },
      { value: 'exit', label: 'Exit' }
    ];
    const action = await select({ message: 'What do you want to do?', options });
    if (isCancel(action) || action === 'exit') return;
    console.log('');
    if (action === 'commit') await runCommitWorkflow();
    else if (action === 'sync') await syncWithRemote();
    else if (action === 'push') await handlePushToRemote();
    else if (action === 'branches') await manageBranches();
    else if (action === 'stash') await manageStash();
    else if (action === 'inspect') inspectRepository();
    else if (action === 'help') await showHelp();
    else if (action === 'conflicts') await handleInProgressOperation();
    console.log(chalk.dim('\nReturning to workspace…'));
  }
}
