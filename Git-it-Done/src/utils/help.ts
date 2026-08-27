import { select, isCancel } from '@clack/prompts';
import chalk from 'chalk';

export interface HelpEntry { title: string; command: string; description: string }

const ENTRIES: Record<string, HelpEntry> = {
  commit: { title: 'Commit changes', command: 'git add … && git commit -m "…"', description: 'Stage selected changes and create a commit.' },
  sync: { title: 'Sync with remote', command: 'git fetch --prune && git pull --ff-only / git push', description: 'Fetch first, then safely bring your branch up to date or publish it.' },
  push: { title: 'Push current branch', command: 'git push [--set-upstream <remote> <branch>]', description: 'Publish the current branch after a confirmation.' },
  branches: { title: 'Manage branches', command: 'git branch / git switch / git switch -c <name>', description: 'List, switch, or create branches without deleting or merging them.' },
  stash: { title: 'Save or restore work', command: 'git stash push / list / apply / pop / drop', description: 'Put work aside and restore it when you are ready.' },
  conflicts: { title: 'Resolve an in-progress operation', command: 'git add <file> && git merge --continue', description: 'Inspect conflicts, open files in your editor, then continue or abort safely.' },
  inspect: { title: 'Inspect repository', command: 'git status / log / remote -v', description: 'See a readable summary of repository state and recent activity.' }
};

export function helpEntry(action: string): HelpEntry | undefined { return ENTRIES[action]; }

export async function showHelp(): Promise<void> {
  const action = await select({ message: 'What would you like explained?', options: Object.entries(ENTRIES).map(([value, entry]) => ({ value, label: entry.title, hint: entry.description })) });
  if (isCancel(action)) return;
  const entry = helpEntry(action as string);
  if (entry) console.log(`\n${chalk.bold(entry.title)}\n${entry.description}\n${chalk.dim(`Native Git: ${entry.command}`)}`);
}
