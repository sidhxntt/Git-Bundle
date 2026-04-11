import { gitCommand } from "./gitCommand";
import { FileChange, GitChanges } from "./types/types";

// Get file changes
function parseGitStatus(output: string, defaultStatus = ''): FileChange[] {
  return output
    .split('\n')
    .filter(Boolean)
    .map(line => {
      if (defaultStatus) {
        return { status: defaultStatus, file: line };
      }
      const [status, ...fileParts] = line.split('\t');
      return { status, file: fileParts.join('\t') };
    });
}

export function getChanges(): GitChanges {
  const stagedOutput = gitCommand('diff --cached --name-status') || '';
  const unstagedOutput = gitCommand('diff --name-status') || '';
  const untrackedOutput = gitCommand('ls-files --others --exclude-standard') || '';

  return {
    staged: parseGitStatus(stagedOutput),
    unstaged: parseGitStatus(unstagedOutput),
    untracked: parseGitStatus(untrackedOutput, '??')
  };
}
