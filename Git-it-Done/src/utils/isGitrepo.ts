import { gitCommand } from "./gitCommand";

// Check if we're in a git repository
export function isGitRepo(): boolean {
  return !!gitCommand('rev-parse --git-dir');
}
