import { confirm, isCancel, select, text } from '@clack/prompts';
import chalk from 'chalk';
import { gitCommand, gitErrorText, gitOutput } from './gitCommand.js';
import { getRepositoryState, hasLocalChanges } from './repository.js';
import { validateBranchName } from './validation.js';

export function buildCreateBranchArgs(name: string): string[] { return ['switch', '-c', name]; }

export async function manageBranches(): Promise<void> {
  const action = await select({ message: 'Branch action:', options: [{ value: 'switch', label: 'Switch branch' }, { value: 'create', label: 'Create branch' }, { value: 'list', label: 'List branches' }] });
  if (isCancel(action)) return;
  if (action === 'list') return void console.log(`\n${gitOutput(['branch', '--verbose', '--no-abbrev']) ?? 'No branches found.'}`);
  if (action === 'create') return void (await createBranch());
  await switchBranch();
}

async function createBranch(): Promise<void> {
  const name = await text({ message: 'New branch name:', placeholder: 'feature/my-change', validate: value => validateBranchName(value) });
  if (isCancel(name)) return;
  const confirmed = await confirm({ message: `Create and switch to "${name}"?` });
  if (isCancel(confirmed) || !confirmed) return;
  const result = gitCommand(buildCreateBranchArgs(name as string));
  console.log(result.ok ? chalk.green(`Now on ${name}.`) : chalk.red(gitErrorText(result)));
}

async function switchBranch(): Promise<void> {
  const state = getRepositoryState();
  if (hasLocalChanges(state.changes)) return void console.log(chalk.yellow('Commit or stash local changes before switching branches.'));
  const branches = (gitOutput(['branch', '--format=%(refname:short)']) ?? '').split('\n').filter(Boolean);
  const target = await select({ message: 'Switch to:', options: branches.filter(branch => branch !== state.branch).map(branch => ({ value: branch, label: branch })) });
  if (isCancel(target)) return;
  const confirmed = await confirm({ message: `Switch to "${target}"?` });
  if (isCancel(confirmed) || !confirmed) return;
  const result = gitCommand(['switch', target as string]);
  console.log(result.ok ? chalk.green(`Now on ${target}.`) : chalk.red(gitErrorText(result)));
}
