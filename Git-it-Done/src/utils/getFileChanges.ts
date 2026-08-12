import { gitCommand } from './gitCommand.js';
import { FileChange, GitChanges } from './types/types.js';

/**
 * Parse `git diff --name-status -z` output.
 *
 * With `-z` every field is its own NUL-terminated record:
 *   `M\0path\0`                for ordinary changes
 *   `R100\0oldPath\0newPath\0` for renames (and `C###` for copies)
 *
 * The similarity score is stripped from the status and the destination path is
 * used for renames/copies, so downstream code never sees `R100` or a bogus
 * `old\tnew` path.
 */
export function parseNameStatusZ(output: string): FileChange[] {
  const tokens = output.split('\0').filter(token => token.length > 0);
  const changes: FileChange[] = [];

  for (let i = 0; i < tokens.length; ) {
    const raw = tokens[i++];
    const status = raw.charAt(0).toUpperCase();

    if (status === 'R' || status === 'C') {
      const from = tokens[i++];
      const to = tokens[i++];
      if (from === undefined || to === undefined) break;
      changes.push({ status, file: to, from });
    } else {
      const file = tokens[i++];
      if (file === undefined) break;
      changes.push({ status, file });
    }
  }

  return changes;
}

/** Parse a NUL-separated list of paths (e.g. `git ls-files -z`). */
export function parseNulList(output: string, status: string): FileChange[] {
  return output
    .split('\0')
    .filter(file => file.length > 0)
    .map(file => ({ status, file }));
}

function nameStatus(args: string[]): FileChange[] {
  const result = gitCommand(args);
  return result.ok ? parseNameStatusZ(result.stdout) : [];
}

export function getChanges(): GitChanges {
  const staged = nameStatus(['diff', '--cached', '--name-status', '--find-renames', '-z']);
  const unstaged = nameStatus(['diff', '--name-status', '--find-renames', '-z']);

  // `--full-name` + `:/` keep untracked paths repo-root-relative like the diff
  // output above, even when the tool is invoked from a subdirectory.
  const untrackedResult = gitCommand([
    'ls-files',
    '--others',
    '--exclude-standard',
    '--full-name',
    '-z',
    '--',
    ':/'
  ]);

  return {
    staged,
    unstaged,
    untracked: untrackedResult.ok ? parseNulList(untrackedResult.stdout, '??') : []
  };
}
