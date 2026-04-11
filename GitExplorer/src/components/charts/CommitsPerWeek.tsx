import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { GitCommit } from "lucide-react";
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

const CommitsPerWeek = ({ commits }) => {
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

  return (
    <>
      <Card className="bg-gradient-card border-border shadow-card flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm">Commit Activity Metrics</CardTitle>
          <CardDescription>Average vs peak commit activity</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          {commits &&
          commits.total_weekly_commits &&
          commits.total_weekly_commits.length > 0 ? (
            <ChartContainer
              config={{
                value: { label: "Commits", color: "#34d399" },
              }}
              className="h-full w-full min-h-[200px]"
            >
              <BarChart
                data={[
                  {
                    metric: "Average",
                    value: Number(avgCommitsPerWeek),
                    fill: "#a78bfa",
                  },
                  {
                    metric: "Peak",
                    value: Number(maxWeeklyCommits),
                    fill: "#60a5fa",
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
                  fontSize={12}
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
                      metric: "Average",
                      value: Number(avgCommitsPerWeek),
                      fill: "#a78bfa",
                    },
                    {
                      metric: "Peak",
                      value: Number(maxWeeklyCommits),
                      fill: "#60a5fa",
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
            {avgCommitsPerWeek} commits per week on average
            <GitCommit className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Peak reached {maxWeeklyCommits} commits in one week
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default CommitsPerWeek;
