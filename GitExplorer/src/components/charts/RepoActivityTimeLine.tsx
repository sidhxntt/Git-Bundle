import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { useMemo, useState } from "react";

const activityChartConfig = {
  commits: { label: "Commits", color: "#60a5fa" },
  pullRequests: { label: "Pull Requests", color: "#34d399" },
  issues: { label: "Issues", color: "#fb923c" },
  contributors: { label: "Contributors", color: "#a78bfa" },
};

const RepoActivityTimeLine = ({ commits }) => {
  const [timeRange, setTimeRange] = useState("30d");
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
  const allActivityData = useMemo(() => {
    if (!commits?.total_weekly_commits) return [];

    const weeklyCommits = commits.total_weekly_commits;
    const weeks = [];
    const today = new Date();

    weeklyCommits.forEach((weekCommits, weekIndex) => {
      const weekDate = new Date(today);
      weekDate.setDate(
        weekDate.getDate() - (weeklyCommits.length - weekIndex) * 7
      );

      weeks.push({
        date: weekDate.toISOString().split("T")[0],
        commits: weekCommits,
        pullRequests: Math.floor(weekCommits * 0.2),
        issues: Math.floor(weekCommits * 0.3),
        contributors: Math.min(Math.floor(weekCommits * 0.4), 10),
      });
    });

    return weeks;
  }, [commits]);
  const activityData = useMemo(() => {
    const referenceDate = new Date();
    let daysToSubtract = 30;

    if (timeRange === "90d") {
      daysToSubtract = 90;
    }

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return allActivityData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [allActivityData, timeRange]);

  return (
    <>
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="text-sm">
              Repository Activity Timeline
            </CardTitle>
            <CardDescription>
              Showing activity for the last{" "}
              {timeRange === "90d" ? "90 days" : "30 days"}
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 90 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {activityData && activityData.length > 0 ? (
            <ChartContainer
              config={activityChartConfig}
              className="aspect-auto h-[400px] w-full"
            >
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="fillCommits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="fillPullRequests"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillIssues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="fillContributors"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#374151"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="contributors"
                  type="natural"
                  fill="url(#fillContributors)"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="issues"
                  type="natural"
                  fill="url(#fillIssues)"
                  stroke="#fb923c"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="pullRequests"
                  type="natural"
                  fill="url(#fillPullRequests)"
                  stroke="#34d399"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="commits"
                  type="natural"
                  fill="url(#fillCommits)"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <p className="text-sm">Data not available</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
          <div className="flex gap-2 leading-none font-medium">
            Avg {avgCommitsPerWeek} commits per week
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Peak activity: {maxWeeklyCommits} commits in a week
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default RepoActivityTimeLine;
