import { useQuery } from "@tanstack/react-query";
import {
  FileNode,
  GitHubRepositoryData,
  RepoOverview,
  ContributorsData,
  CommitsData,
  LanguagesData,
  BranchesData,
  PullRequestsData,
  Issue,
  Commit,
} from "@/utils/types";
import fetchAllPages from "@/utils/fetchAllPages";
import buildFileTree from "@/utils/buildFileTree";

// Main fetch function
const fetchGitHubRepository = async (
  repositoryUrl: string
): Promise<GitHubRepositoryData> => {
  const urlParts = repositoryUrl.replace("https://github.com/", "").split("/");
  const owner = urlParts[0];
  const repo = urlParts[1];

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
  if (githubToken) headers["Authorization"] = `Bearer ${githubToken}`;

  try {
    // Fetch all data in parallel - FIXED: Removed duplicate await
    const [
      repoResponse,
      contributorsResponse,
      participationResponse,
      languagesResponse,
      branchesData,
      pullsData,
      issuesData,
      fileTreeResponse,
      commitsResponse,
    ] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
        { headers }
      ),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/stats/participation`,
        { headers }
      ),
      fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers,
      }),
      fetchAllPages(
        `https://api.github.com/repos/${owner}/${repo}/branches`,
        headers
      ),
      fetchAllPages(
        `https://api.github.com/repos/${owner}/${repo}/pulls?state=open`,
        headers
      ),
      fetchAllPages(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=open`,
        headers
      ),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
        { headers }
      ),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`,
        { headers }
      ),
    ]);

    if (!repoResponse.ok) {
      const errorData = await repoResponse.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to fetch repository data: ${repoResponse.status}`
      );
    }
    const repoData = await repoResponse.json();

    // Process repository overview
    const pullRequestCount = pullsData.length;
    const issuesCount = (
      issuesData as Array<{ pull_request?: unknown }>
    ).filter((issue) => !issue.pull_request).length;

    // FIXED: Typo total_subsribers -> total_subscribers
    const repoOverview: RepoOverview = {
      repo_name: repoData.full_name,
      owner: repoData.owner?.login || "unknown",
      description: repoData.description || "",
      total_stars: Number(repoData.stargazers_count) || 0,
      total_forks: Number(repoData.forks_count) || 0,
      total_open_issues: issuesCount,
      total_subscribers: Number(repoData.subscribers_count) || 0,
    };

    // Process contributors
    let contributors: ContributorsData | null = null;
    if (contributorsResponse.ok) {
      const contributorsData = await contributorsResponse.json();
      if (Array.isArray(contributorsData) && contributorsData.length > 0) {
        const totalContributions = contributorsData.reduce(
          (sum, c) => sum + (c.total || 0),
          0
        );
        const top5 = contributorsData
          .filter((c) => c.total > 0)
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
          .map((c) => ({
            user: c.author?.login || "Unknown",
            contribution_count: c.total,
          }));

        contributors = {
          total_contributions: totalContributions,
          top_5_contributors: top5,
        };
      }
    }

    // Process commits
    let commits: CommitsData | null = null;
    if (participationResponse.ok) {
      const participationData = await participationResponse.json();
      commits = { total_weekly_commits: participationData.all || [] };
    }

    // Process languages
    let languages: LanguagesData | null = null;
    if (languagesResponse.ok) {
      const languagesData = await languagesResponse.json();
      languages = { language_composition: languagesData };
    }

    // Process branches
    const branches: BranchesData = { total_branches: branchesData.length };

    // Process pull requests
    const pullRequests: PullRequestsData = { total_pr: pullRequestCount };

    // Process issues (filter out PRs)
    const issues: Issue[] = (issuesData as Array<any>)
      .filter((issue) => !issue.pull_request)
      .map((issue) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        state: issue.state,
        created_at: issue.created_at,
        user: {
          login: issue.user?.login || "unknown",
          avatar_url: issue.user?.avatar_url || "",
        },
        html_url: issue.html_url,
        labels: issue.labels || [],
      }));

    // Process recent commits
    let recentCommits: Commit[] = [];
    if (commitsResponse.ok) {
      recentCommits = await commitsResponse.json();
    }

    // Process file structure
    let fileStructure: FileNode[] = [];
    if (fileTreeResponse.ok) {
      const treeData = await fileTreeResponse.json();
      if (treeData.tree && Array.isArray(treeData.tree)) {
        fileStructure = buildFileTree(treeData.tree);
      }
    }

    return {
      repoOverview,
      contributors,
      pullRequests,
      commits,
      languages,
      branches,
      issues,
      recentCommits,
      fileStructure,
    };
  } catch (error) {
    console.error("Error fetching repository data:", error);
    throw error;
  }
};

// Main hook
export const useGitHubRepository = (repositoryUrl: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["githubRepository", repositoryUrl],
    queryFn: () => fetchGitHubRepository(repositoryUrl),
    enabled: !!repositoryUrl,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  };
};

// Convenience hooks for specific data
export const useRepoOverview = (repositoryUrl: string) => {
  const { data, loading, error } = useGitHubRepository(repositoryUrl);
  return { repoOverview: data?.repoOverview ?? null, loading, error };
};

export const useContributors = (repositoryUrl: string) => {
  const { data, loading, error } = useGitHubRepository(repositoryUrl);
  return { contributors: data?.contributors ?? null, loading, error };
};

export const useFileStructure = (repositoryUrl: string) => {
  const { data, loading, error } = useGitHubRepository(repositoryUrl);
  return { fileStructure: data?.fileStructure ?? [], loading, error };
};

export const useIssues = (repositoryUrl: string) => {
  const { data, loading, error } = useGitHubRepository(repositoryUrl);
  return { issues: data?.issues ?? [], loading, error };
};

export const useCommits = (repositoryUrl: string) => {
  const { data, loading, error } = useGitHubRepository(repositoryUrl);
  return { commits: data?.recentCommits ?? [], loading, error };
};
