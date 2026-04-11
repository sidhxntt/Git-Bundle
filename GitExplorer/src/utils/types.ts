export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  hotspot?: boolean;
  complexity?: "low" | "medium" | "high";
  size?: number;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
}

export interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface RepoOverview {
  repo_name: string;
  owner: string;
  description: string;
  total_stars: number;
  total_forks: number;
  total_open_issues: number;
  total_subscribers: number;
}

export interface Contributor {
  user: string;
  contribution_count: number;
}

export interface ContributorsData {
  total_contributions: number;
  top_5_contributors: Contributor[];
}

export interface PullRequestsData {
  total_pr: number;
}

export interface CommitsData {
  total_weekly_commits: number[];
}

export interface LanguagesData {
  language_composition: Record<string, number>;
}

export interface BranchesData {
  total_branches: number;
}

interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
}

export interface GitHubRepositoryData {
  repoOverview: RepoOverview;
  contributors: ContributorsData | null;
  pullRequests: PullRequestsData;
  commits: CommitsData | null;
  languages: LanguagesData | null;
  branches: BranchesData;
  issues: Issue[];
  recentCommits: Commit[];
  fileStructure: FileNode[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  fileStructure: FileNode[];
  commits: Commit[];
  issues: Issue[];
  repoData: any;
}

export type { Message, ChatInterfaceProps, GitHubTreeItem };