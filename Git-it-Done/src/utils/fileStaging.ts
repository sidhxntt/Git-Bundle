import { select, multiselect, spinner, cancel, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import { gitCommand } from './gitCommand';
import { getChanges } from './getFileChanges';
import { formatFileStatus } from './formatFileStatus';
import { GitChanges, FileChange } from './types/types';

export async function handleFileStaging(changes: GitChanges): Promise<FileChange[]> {
  let filesToCommit = changes.staged;

  // If files are already staged, return them
  if (changes.staged.length > 0) {
    return filesToCommit;
  }

  // Handle unstaged files
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
    filesToCommit = await stageAllFiles();
  } else if (stageOption === 'select') {
    filesToCommit = await stageSelectedFiles(changes);
  }

  return filesToCommit;
}

async function stageAllFiles(): Promise<FileChange[]> {
  const s = spinner();
  s.start('Staging all files...');
  
  const result = gitCommand('add .');
  if (result === null) {
    s.stop('❌ Failed to stage files');
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
    options: unstaged.map(({ status, file }) => ({
      value: file,
      label: `${formatFileStatus(status)} ${file}`
    })),
    required: true
  });

  if (isCancel(selectedFiles)) {
    cancel('Operation cancelled');
    process.exit(0);
  }

  const s = spinner();
  s.start('Staging selected files...');
  
  let stagingFailed = false;
  (selectedFiles as string[]).forEach(file => {
    const result = gitCommand(`add "${file}"`);
    if (result === null) {
      stagingFailed = true;
    }
  });

  if (stagingFailed) {
    s.stop('❌ Some files failed to stage');
    console.log(chalk.yellow('Some files may not have been staged properly.'));
  } else {
    s.stop('Files staged');
  }

  return getChanges().staged;
}