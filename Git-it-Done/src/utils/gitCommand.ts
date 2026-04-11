import { execSync } from 'child_process';

// Utility function to execute git commands with better error handling
export function gitCommand(command: string): string | null {
  try {
    return execSync(`git ${command}`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    }).trim();
  } catch {
    return null;
  }
}
