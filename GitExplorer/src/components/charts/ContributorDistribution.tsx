import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

const contributorsChartConfig = {
  commits: { label: "Commits", color: "#60a5fa" },
};
const ChartFallback = () => (
  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
    <p className="text-sm">Data not available</p>
  </div>
);

const ContributorDistribution = ({ contributors }) => {
  const topContributors = useMemo(() => {
    if (!contributors?.top_5_contributors) return [];
    return contributors.top_5_contributors.map((c) => ({
      name: c.user,
      commits: c.contribution_count,
    }));
  }, [contributors]);

  // Top Contributor Share
  const topContributorShare = useMemo(() => {
    if (!contributors?.top_5_contributors || !contributors?.total_contributions)
      return 0;
    const topCount =
      contributors.top_5_contributors[0]?.contribution_count || 0;
    return ((topCount / contributors.total_contributions) * 100).toFixed(1);
  }, [contributors]);

  // Top 5 Contributor Coverage
  const top5ContributorCoverage = useMemo(() => {
    if (!contributors?.top_5_contributors || !contributors?.total_contributions)
      return 0;
    const top5Total = contributors.top_5_contributors.reduce(
      (sum, c) => sum + c.contribution_count,
      0
    );
    return ((top5Total / contributors.total_contributions) * 100).toFixed(1);
  }, [contributors]);

  return (
    <>
      <Card className="bg-gradient-card border-border shadow-card flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm">Top Contributors</CardTitle>
          <CardDescription>Most active contributors by commits</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          {topContributors.length > 0 ? (
            <>
              <ChartContainer
                config={contributorsChartConfig}
                className="h-full w-full min-h-[300px]"
              >
                <BarChart
                  data={topContributors}
                  layout="vertical"
                  margin={{ left: -20, right: 10, top: 10, bottom: 10 }}
                >
                  <XAxis type="number" dataKey="commits" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={100}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="commits" fill="#60a5fa" radius={5} />
                </BarChart>
              </ChartContainer>
            </>
          ) : (
            <ChartFallback />
          )}
        </CardContent>
        {topContributors.length > 0 && (
          <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
            <div className="flex gap-2 leading-none font-medium">
              Top contributor: {topContributorShare}% of all commits
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Top 5 cover {top5ContributorCoverage}% of contributions
            </div>
          </CardFooter>
        )}
      </Card>
    </>
  );
};

export default ContributorDistribution;
