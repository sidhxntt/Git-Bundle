import { confirm, isCancel, select, text } from '@clack/prompts';
import chalk from 'chalk';
import { gitCommand, gitErrorText, gitOutput } from './gitCommand.js';
import { getRepositoryState, hasLocalChanges } from './repository.js';

export function buildStashApplyArgs(ref: string, pop: boolean): string[] { return ['stash', pop ? 'pop' : 'apply', ref]; }

export async function manageStash(): Promise<void> {
  const action = await select({ message: 'Work-saving action:', options: [{ value: 'save', label: 'Save current work to a stash' }, { value: 'apply', label: 'Apply a stash (keep it)' }, { value: 'pop', label: 'Pop a stash (apply and remove)' }, { value: 'drop', label: 'Drop a stash' }, { value: 'list', label: 'List stashes' }] });
  if (isCancel(action)) return;
  if (action === 'list') return void console.log(`\n${gitOutput(['stash', 'list']) ?? 'No stashes.'}`);
  if (action === 'save') return void (await saveStash());
  await restoreStash(action as 'apply' | 'pop' | 'drop');
}

async function saveStash(): Promise<void> {
  if (!hasLocalChanges(getRepositoryState().changes)) return void console.log(chalk.yellow('There is no work to stash.'));
  const message = await text({ message: 'Stash message (optional):', placeholder: 'work in progress' });
  if (isCancel(message)) return;
  const confirmed = await confirm({ message: 'Save all tracked and untracked changes to a stash?' });
  if (isCancel(confirmed) || !confirmed) return;
  const args = ['stash', 'push', '--include-untracked']; if ((message as string).trim()) args.push('-m', message as string);
  const result = gitCommand(args); console.log(result.ok ? chalk.green('Work saved to stash.') : chalk.red(gitErrorText(result)));
}

async function restoreStash(action: 'apply' | 'pop' | 'drop'): Promise<void> {
  if ((action === 'apply' || action === 'pop') && hasLocalChanges(getRepositoryState().changes)) return void console.log(chalk.yellow('Commit or stash your current work before restoring a stash.'));
  const refs = (gitOutput(['stash', 'list', '--format=%gd']) ?? '').split('\n').filter(Boolean);
  const ref = await select({ message: 'Choose a stash:', options: refs.map(value => ({ value, label: value })) });
  if (isCancel(ref)) return;
  const confirmed = await confirm({ message: `${action === 'drop' ? 'Permanently drop' : action === 'pop' ? 'Apply and remove' : 'Apply'} ${ref}?` });
  if (isCancel(confirmed) || !confirmed) return;
  const args = action === 'drop' ? ['stash', 'drop', ref as string] : buildStashApplyArgs(ref as string, action === 'pop');
  const result = gitCommand(args); console.log(result.ok ? chalk.green(`Stash ${action} completed.`) : chalk.red(gitErrorText(result)));
}
