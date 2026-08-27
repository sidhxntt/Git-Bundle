import { spawnSync } from 'child_process';
import { confirm, isCancel, select } from '@clack/prompts';
import chalk from 'chalk';
import { gitCommand, gitErrorText } from './gitCommand.js';
import { GitOperation, getRepositoryState } from './repository.js';

export interface OperationCommands { continueArgs: string[] | null; abortArgs: string[] }

export function operationCommands(operation: GitOperation): OperationCommands {
  switch (operation) {
    case 'merge': return { continueArgs: ['commit', '--no-edit'], abortArgs: ['merge', '--abort'] };
    case 'rebase': return { continueArgs: ['rebase', '--continue'], abortArgs: ['rebase', '--abort'] };
    case 'am': return { continueArgs: ['am', '--continue'], abortArgs: ['am', '--abort'] };
    case 'cherry-pick': return { continueArgs: ['cherry-pick', '--continue'], abortArgs: ['cherry-pick', '--abort'] };
    case 'revert': return { continueArgs: ['revert', '--continue'], abortArgs: ['revert', '--abort'] };
    case 'bisect': return { continueArgs: null, abortArgs: ['bisect', 'reset'] };
  }
}

function operationLabel(operation: GitOperation): string { return operation === 'cherry-pick' ? 'cherry-pick' : operation; }

export async function handleInProgressOperation(): Promise<void> {
  const state = getRepositoryState();
  if (!state.operation) return void console.log(chalk.green('No merge, rebase, cherry-pick, revert, or bisect is in progress.'));
  const { operation, conflicts } = state;
  console.log(chalk.yellow(`\n${operationLabel(operation)} in progress.`));
  if (conflicts.length) console.log(chalk.red(`Conflicted files:\n${conflicts.map(file => `  • ${file}`).join('\n')}`));
  else console.log('No unresolved files detected. You can continue or abort the operation.');
  const commands = operationCommands(operation);
  const action = await select({ message: `Resolve ${operationLabel(operation)}:`, options: [
    ...(conflicts.length ? [{ value: 'edit', label: 'Open a conflicted file in my editor' }, { value: 'resolved', label: 'Mark a resolved file as staged' }] : []),
    ...(commands.continueArgs ? [{ value: 'continue', label: `Continue ${operationLabel(operation)}` }] : []),
    { value: 'abort', label: `Abort ${operationLabel(operation)}` },
    { value: 'back', label: 'Back to workspace' }
  ] });
  if (isCancel(action) || action === 'back') return;
  if (action === 'edit') return void (await editConflict(conflicts));
  if (action === 'resolved') return void (await stageResolved(conflicts));
  await finishOperation(operation, action as 'continue' | 'abort');
}

async function editConflict(files: string[]): Promise<void> {
  const file = await select({ message: 'Open which file?', options: files.map(value => ({ value, label: value })) });
  if (isCancel(file)) return;
  const editor = process.env.GIT_EDITOR || process.env.VISUAL || process.env.EDITOR;
  if (!editor) return void console.log(chalk.yellow(`No editor is configured. Resolve ${file} in your editor, then return here to mark it resolved.`));
  const [command, ...args] = editor.split(/\s+/).filter(Boolean);
  const result = spawnSync(command, [...args, file as string], { stdio: 'inherit' });
  if (result.error) console.log(chalk.red(`Could not open ${command}: ${result.error.message}`));
  else console.log('Editor closed. Select “Mark a resolved file as staged” after removing conflict markers.');
}

async function stageResolved(files: string[]): Promise<void> {
  const file = await select({ message: 'Which resolved file should be staged?', options: files.map(value => ({ value, label: value })) });
  if (isCancel(file)) return;
  const confirmed = await confirm({ message: `Mark ${file} as resolved by staging it?` });
  if (isCancel(confirmed) || !confirmed) return;
  const result = gitCommand(['add', '--', file as string]);
  console.log(result.ok ? chalk.green(`${file} staged. Resolve remaining files, then continue.`) : chalk.red(gitErrorText(result)));
}

async function finishOperation(operation: GitOperation, action: 'continue' | 'abort'): Promise<void> {
  const state = getRepositoryState();
  if (action === 'continue' && state.conflicts.length) return void console.log(chalk.yellow('Resolve and stage every conflicted file before continuing.'));
  const confirmed = await confirm({ message: `${action === 'abort' ? 'Abort' : 'Continue'} this ${operationLabel(operation)}?` });
  if (isCancel(confirmed) || !confirmed) return;
  const commands = operationCommands(operation);
  if (action === 'continue' && !commands.continueArgs) return;
  const result = gitCommand(action === 'continue' ? commands.continueArgs! : commands.abortArgs);
  console.log(result.ok ? chalk.green(`${operationLabel(operation)} ${action === 'abort' ? 'aborted' : 'completed'}.`) : chalk.red(gitErrorText(result)));
}
