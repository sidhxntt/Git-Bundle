import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Activity } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  PolarAngleAxis,
  Legend,
  RadarChart,
  Radar,
  PolarRadiusAxis,
  PolarGrid,
} from "recharts";
import { useMemo } from "react";

const ChartFallback = () => (
  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
    <p className="text-sm">Data not available</p>
  </div>
);

const CommitsVolatility = ({ commits }) => {
  // Average Commits per Week
  const avgCommitsPerWeek = useMemo(() => {
    if (!commits?.total_weekly_commits) return 0;
    const total = commits.total_weekly_commits.reduce((a, b) => a + b, 0);
    return (total / commits.total_weekly_commits.length).toFixed(1);
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

  return (
    <>
      <Card className="bg-gradient-card border-border shadow-card flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm">Commit Consistency Analysis</CardTitle>
          <CardDescription>Activity volatility and stability</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 pb-2">
          {commits &&
          commits.total_weekly_commits &&
          commits.total_weekly_commits.length > 0 ? (
            <ChartContainer
              config={{
                value: { label: "Range", color: "#a78bfa" },
              }}
              className="h-full w-full min-h-[250px] flex justify-center items-center"
            >
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={[
                  {
                    metric: "Low",
                    value: Math.max(
                      0,
                      Number(avgCommitsPerWeek) - Number(commitVolatility)
                    ),
                  },
                  {
                    metric: "Average",
                    value: Number(avgCommitsPerWeek),
                  },
                  {
                    metric: "High",
                    value: Number(avgCommitsPerWeek) + Number(commitVolatility),
                  },
                ]}
              >
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="metric"
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <PolarRadiusAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Radar
                  name="Commits"
                  dataKey="value"
                  stroke="#60a5fa"
                  fill="#a78bfa"
                  fillOpacity={0.5}
                />
                <Legend />
              </RadarChart>
            </ChartContainer>
          ) : (
            <ChartFallback />
          )}
        </CardContent>

        <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
          <div className="flex gap-2 leading-none font-medium">
            Volatility: ±{commitVolatility} commits
            <Activity className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            {Number(commitVolatility) < 10
              ? "Highly consistent activity"
              : Number(commitVolatility) < 20
              ? "Moderately consistent activity"
              : "Variable activity patterns"}
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default CommitsVolatility;
