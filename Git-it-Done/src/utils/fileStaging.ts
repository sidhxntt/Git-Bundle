import { select, multiselect, spinner, cancel, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import { gitCommand, gitErrorText } from './gitCommand.js';
import { getChanges } from './getFileChanges.js';
import { getRepoRoot } from './repoRoot.js';
import { formatFileStatus } from './formatFileStatus.js';
import { GitChanges, FileChange } from './types/types.js';

export async function handleFileStaging(changes: GitChanges): Promise<FileChange[]> {
  let current = changes;

  // Never silently adopt a pre-existing index — show it and ask.
  if (current.staged.length > 0) {
    const decision = await confirmExistingIndex(current.staged);

    if (decision === 'keep') {
      return current.staged;
    }

    resetIndex();
    current = getChanges();

    if (current.unstaged.length === 0 && current.untracked.length === 0) {
      return [];
    }
  }

  const stageOption = await select({
    message: 'No files are staged. What would you like to do?',
    options: [
      { value: 'all', label: 'Stage all changes' },
      { value: 'select', label: 'Select files to stage' },
      { value: 'cancel', label: 'Cancel' }
    ]
  });

  if (isCancel(stageOption) || stageOption === 'cancel') {
    cancel('Operation cancelled');
    process.exit(0);
  }

  if (stageOption === 'all') {
    return await stageAllFiles();
  }
  if (stageOption === 'select') {
    return await stageSelectedFiles(current);
  }

  return current.staged;
}

async function confirmExistingIndex(staged: FileChange[]): Promise<'keep' | 'reset'> {
  console.log(chalk.bold('\n📦 Already staged (from a previous session or manual `git add`):'));
  staged.forEach(({ status, file, from }) =>
    console.log(`  ${formatFileStatus(status)} ${from ? `${from} → ${file}` : file}`)
  );

  const decision = await select({
    message: `${staged.length} file(s) are already staged. What would you like to do?`,
    options: [
      { value: 'keep', label: 'Commit these staged files' },
      { value: 'reset', label: 'Unstage everything and choose again' },
      { value: 'cancel', label: 'Cancel' }
    ]
  });

  if (isCancel(decision) || decision === 'cancel') {
    cancel('Operation cancelled');
    process.exit(0);
  }

  return decision as 'keep' | 'reset';
}

function resetIndex(): void {
  const s = spinner();
  s.start('Unstaging files...');

  let result = gitCommand(['reset', '--quiet', '--', ':/']);

  // An unborn branch has no HEAD to reset against; drop the paths from the index.
  if (!result.ok) {
    result = gitCommand(['rm', '--cached', '-r', '-f', '--quiet', '--', ':/']);
  }

  if (!result.ok) {
    s.stop('❌ Failed to unstage files');
    console.log(chalk.red(gitErrorText(result)));
    cancel('Failed to unstage files');
    process.exit(1);
  }

  s.stop('Index cleared');
}

async function stageAllFiles(): Promise<FileChange[]> {
  const s = spinner();
  s.start('Staging all files...');

  // `:/` makes this repo-root-relative, so the staged set matches the status
  // display even when the tool is run from a subdirectory.
  const result = gitCommand(['add', '-A', '--', ':/']);
  if (!result.ok) {
    s.stop('❌ Failed to stage files');
    console.log(chalk.red(gitErrorText(result)));
    cancel('Failed to stage files');
    process.exit(1);
  }

  s.stop('All files staged');
  return getChanges().staged;
}

async function stageSelectedFiles(changes: GitChanges): Promise<FileChange[]> {
  const unstaged = [...changes.unstaged, ...changes.untracked];

  const selectedFiles = await multiselect({
    message: 'Select files to stage:',
    options: unstaged.map(({ status, file, from }) => ({
      value: file,
      label: `${formatFileStatus(status)} ${from ? `${from} → ${file}` : file}`
    })),
    required: true
  });

  if (isCancel(selectedFiles)) {
    cancel('Operation cancelled');
    process.exit(0);
  }

  const files = selectedFiles as string[];
  const s = spinner();
  s.start('Staging selected files...');

  // Paths are repo-root-relative, so run from the repo root; `--literal-pathspecs`
  // stops names containing `*`, `[` or a leading `:` being read as pathspec magic.
  const repoRoot = getRepoRoot();
  const result = gitCommand(['--literal-pathspecs', 'add', '--', ...files], {
    cwd: repoRoot ?? undefined
  });

  if (!result.ok) {
    s.stop('❌ Some files failed to stage');
    console.log(chalk.red(gitErrorText(result)));
  } else {
    s.stop('Files staged');
  }

  return getChanges().staged;
}
