export interface FileChange {
  status: string;
  file: string;
}

export interface GitChanges {
  staged: FileChange[];
  unstaged: FileChange[];
  untracked: FileChange[];
}

export interface GitStatus {
  valid: boolean;
  reason?: string;
}

export type CommitType = 
  | 'feat' 
  | 'fix' 
  | 'docs' 
  | 'style' 
  | 'refactor' 
  | 'test' 
  | 'chore' 
  | 'deps' 
  | 'config' 
  | 'remove';

export interface CommitInfo {
  type: CommitType;
  scope?: string;
  description: string;
}