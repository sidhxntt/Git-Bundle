import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const RepoStats = ({
  repoOverview,
  commits,
  pullRequests,
  contributors,
}) => {
  // Stars per Fork Ratio - Popularity vs engagement
  const starsPerForkRatio = useMemo(() => {
    if (!repoOverview || repoOverview.total_forks === 0) return 0;
    return (repoOverview.total_stars / repoOverview.total_forks).toFixed(1);
  }, [repoOverview]);

  // Average Commits per Week
  const avgCommitsPerWeek = useMemo(() => {
    if (!commits?.total_weekly_commits) return 0;
    const total = commits.total_weekly_commits.reduce((a, b) => a + b, 0);
    return (total / commits.total_weekly_commits.length).toFixed(1);
  }, [commits]);

  // Max Weekly Commits - Peak activity
  const maxWeeklyCommits = useMemo(() => {
    if (!commits?.total_weekly_commits) return 0;
    return Math.max(...commits.total_weekly_commits);
  }, [commits]);

  // Commit Volatility - Activity consistency (standard deviation)
  const commitVolatility = useMemo(() => {
    if (!commits?.total_weekly_commits) return 0;
    const values = commits.total_weekly_commits;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
      values.length;
    return Math.sqrt(variance).toFixed(1);
  }, [commits]);

  // PR to Issue Ratio
  const prToIssueRatio = useMemo(() => {
    if (
      !repoOverview?.total_open_issues ||
      repoOverview.total_open_issues === 0
    )
      return 0;
    return (pullRequests?.total_pr / repoOverview.total_open_issues).toFixed(2);
  }, [pullRequests, repoOverview]);

  // Commits per PR
  const commitsPerPR = useMemo(() => {
    if (!pullRequests?.total_pr || pullRequests.total_pr === 0) return 0;
    return (contributors?.total_contributions / pullRequests.total_pr).toFixed(
      1
    );
  }, [contributors, pullRequests]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardDescription>Stars per Fork</CardDescription>
          <CardTitle className="text-3xl">{starsPerForkRatio}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Popularity vs engagement ratio
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardDescription>Avg Commits/Week</CardDescription>
          <CardTitle className="text-3xl">{avgCommitsPerWeek}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Peak: {maxWeeklyCommits} commits
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardDescription>Commit Volatility</CardDescription>
          <CardTitle className="text-3xl">±{commitVolatility}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Activity consistency metric
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardDescription>PR to Issue Ratio</CardDescription>
          <CardTitle className="text-3xl">{prToIssueRatio}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {commitsPerPR} commits per PR avg
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepoStats;
