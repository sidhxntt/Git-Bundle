import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useGitHubRepository } from "@/hooks/useGitHubData";
import KPI from "./charts/KPI";
import RepoStats from "./charts/RepoStats";
import ContributorDistribution from "./charts/ContributorDistribution";
import LanguageDistribution from "./charts/LanguageDistribution";
import StarsFork from "./charts/StarsForks";
import CommitsPerWeek from "./charts/CommitsPerWeek";
import CommitsVolatility from "./charts/CommitsVolatility";
import PRIssueRatio from "./charts/PRIssueRatio";
import RepoActivityTimeLine from "./charts/RepoActivityTimeLine";

interface RepositoryStatsProps {
  repositoryUrl: string;
}

export const RepositoryStats = ({ repositoryUrl }: RepositoryStatsProps) => {
  const { data, loading, error } = useGitHubRepository(repositoryUrl);

  // Destructure data with null safety
  const repoOverview = data?.repoOverview ?? null;
  const contributors = data?.contributors ?? null;
  const pullRequests = data?.pullRequests ?? null;
  const commits = data?.commits ?? null;
  const languages = data?.languages ?? null;
  const branches = data?.branches ?? null;

  // ==================== LOADING & ERROR STATES ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading repository data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="bg-destructive/10 border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!repoOverview) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Repository Overview - KPI Cards */}
      <KPI 
        repoOverview={repoOverview} 
        branches={branches}
        pullRequests={pullRequests} 
      />

      {/* Derived Metrics Cards */}
      <RepoStats
        repoOverview={repoOverview}
        commits={commits}
        pullRequests={pullRequests}
        contributors={contributors}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Contributors Distribution */}
        <ContributorDistribution contributors={contributors} />

        {/* Language Composition */}
        <LanguageDistribution languages={languages} />
      </div>

      {/* Key Metrics Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stars per Fork Ratio Chart */}
        <StarsFork repoOverview={repoOverview} />

        {/* Avg Commits per Week Chart */}
        <CommitsPerWeek commits={commits} />

        {/* Commit Volatility Chart */}
        <CommitsVolatility commits={commits} />

        {/* PR to Issue Ratio Chart */}
        <PRIssueRatio
          pullRequests={pullRequests}
          repoOverview={repoOverview}
          contributors={contributors}
        />
      </div>

      {/* Repository Activity Timeline */}
      <RepoActivityTimeLine commits={commits} />
    </div>
  );
};