import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { GitPullRequest } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid } from "recharts";
import { useMemo } from "react";

const ChartFallback = () => (
  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
    <p className="text-sm">Data not available</p>
  </div>
);

const PRIssueRatio = ({ pullRequests, repoOverview, contributors }) => {
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
    <>
      <Card className="bg-gradient-card border-border shadow-card flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm">PR vs Issue Comparison</CardTitle>
          <CardDescription>Development workflow balance</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          {pullRequests && repoOverview ? (
            <ChartContainer
              config={{
                value: { label: "Count", color: "#60a5fa" },
              }}
              className="h-full w-full min-h-[200px]"
            >
              <BarChart
                data={[
                  {
                    metric: "Open Issues",
                    value:
                      repoOverview.total_open_issues - pullRequests.total_pr,
                    fill: "#fb923c",
                  },
                  {
                    metric: "Pull Requests",
                    value: pullRequests?.total_pr || 0,
                    fill: "#34d399",
                  },
                ]}
                margin={{ left: -20, right: 10, top: 10, bottom: 10 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#374151"
                />
                <XAxis
                  dataKey="metric"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" radius={4}>
                  {[
                    {
                      metric: "Open Issues",
                      value: repoOverview.total_open_issues,
                      fill: "#fb923c",
                    },
                    {
                      metric: "Pull Requests",
                      value: pullRequests?.total_pr || 0,
                      fill: "#34d399",
                    },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <ChartFallback />
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
          <div className="flex gap-2 leading-none font-medium">
            Ratio: {prToIssueRatio}
            <GitPullRequest className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Average {commitsPerPR} commits per pull request
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default PRIssueRatio;
