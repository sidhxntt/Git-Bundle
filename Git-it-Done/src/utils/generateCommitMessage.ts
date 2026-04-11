import path from 'path';
import { gitCommand } from './gitCommand'; 
import { FileChange } from './types/types';

// Generate commit message based on changes
export function generateCommitMessage(files: FileChange[]): string {
  const fileTypes = new Map<string, number>();
  const operations = { added: 0, modified: 0, deleted: 0, renamed: 0 };
  let scope = '';

  // Analyze files
  for (const { status, file } of files) {
    const ext = path.extname(file);
    fileTypes.set(ext, (fileTypes.get(ext) || 0) + 1);

    switch (status) {
      case 'A': operations.added++; break;
      case 'M': operations.modified++; break;
      case 'D': operations.deleted++; break;
      case 'R': operations.renamed++; break;
    }

    // Determine scope from top-level directory
    if (!scope) {
      const dir = file.split('/')[0];
      if (dir && dir !== file) {
        scope = dir;
      }
    }
  }

  // Detect content types
  const hasPattern = (regex: RegExp) => files.some(f => regex.test(f.file));

  const hasTests = hasPattern(/test|spec/i);
  const hasDocs = hasPattern(/readme|doc|\.md$/i);
  const hasConfig = hasPattern(/config|\.json$|\.ya?ml$|package\.json/i);
  const hasStyles = hasPattern(/\.(css|scss|sass|less)$/i);
  const hasDeps = hasPattern(/package(-lock)?\.json|yarn\.lock|requirements\.txt/i);

  // Determine type and description
  let type = 'chore';
  let description = '';

  if (hasDeps) {
    type = 'deps';
    description = 'update dependencies';
  } else if (hasTests) {
    type = 'test';
    description = 'update tests';
  } else if (hasDocs) {
    type = 'docs';
    description = 'update documentation';
  } else if (hasConfig) {
    type = 'config';
    description = 'update configuration';
  } else if (hasStyles) {
    type = 'style';
    description = 'update styles';
  } else if (operations.added > 0 && operations.modified === 0 && operations.deleted === 0) {
    type = 'feat';
    description = operations.added === 1
      ? `add ${path.basename(files.find(f => f.status === 'A')?.file || '')}`
      : 'add new files';
  } else if (operations.deleted > 0 && operations.added === 0 && operations.modified === 0) {
    type = 'remove';
    description = operations.deleted === 1
      ? `remove ${path.basename(files.find(f => f.status === 'D')?.file || '')}`
      : 'remove files';
  } else if (operations.modified > 0) {
    type = 'fix';
    description = operations.modified === 1 && operations.added === 0 && operations.deleted === 0
      ? `update ${path.basename(files.find(f => f.status === 'M')?.file || '')}`
      : 'update and improve code';
  }

  // Refine with diff content
  try {
    const diff = gitCommand('diff --cached') || '';

    if (/bug|fix|error|issue/i.test(diff)) {
      type = 'fix';
      description = 'resolve issues and bugs';
    } else if (/refactor|restructure/i.test(diff)) {
      type = 'refactor';
      description = 'refactor code structure';
    } else if (/function|def|class|interface/i.test(diff) && type === 'fix') {
      type = 'feat';
      description = 'implement new functionality';
    }
  } catch {
    // Ignore diff errors
  }

  const scopeStr = scope ? `(${scope})` : '';
  return `${type}${scopeStr}: ${description}`;
}
