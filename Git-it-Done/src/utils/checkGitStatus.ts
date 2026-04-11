import { execSync } from 'child_process';
import { gitCommand } from './gitCommand'; 
import { GitStatus } from './types/types';

// Enhanced function to check git repository status
export function checkGitStatus(): GitStatus{
  // Step 1: Check if Git is installed
  try {
    execSync('git --version', { stdio: 'ignore' });
  } catch {
    return {
      valid: false,
      reason: 'Git is not installed or not in PATH',
    };
  }

  // Step 2: Check if inside a Git repository
  if (!gitCommand('rev-parse --git-dir')) {
    return {
      valid: false,
      reason: 'Not in a Git repository',
    };
  }

  // Step 3: Check if Git user config is set
  const userName = gitCommand('config user.name');
  const userEmail = gitCommand('config user.email');

  if (!userName || !userEmail) {
    return {
      valid: false,
      reason: `Git user not configured. Run:\n  git config --global user.name "Your Name"\n  git config --global user.email "you@example.com"`,
    };
  }

  // All checks passed
  return { valid: true };
}
