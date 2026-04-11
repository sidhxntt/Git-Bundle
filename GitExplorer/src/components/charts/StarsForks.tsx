import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Star } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";

import { PieChart, Pie, Legend } from "recharts";

const ChartFallback = () => (
  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
    <p className="text-sm">Data not available</p>
  </div>
);

const StarsFork = ({ repoOverview }) => {
  // Stars per Fork Ratio - Popularity vs engagement
  const starsPerForkRatio = useMemo(() => {
    if (!repoOverview || repoOverview.total_forks === 0) return 0;
    return (repoOverview.total_stars / repoOverview.total_forks).toFixed(1);
  }, [repoOverview]);
  return (
    <>
      <Card className="bg-gradient-card border-border shadow-card flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm">Stars vs Forks Comparison</CardTitle>
          <CardDescription>Popularity vs engagement analysis</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 pb-2">
          {repoOverview &&
          repoOverview.total_stars > 0 &&
          repoOverview.total_forks > 0 ? (
            <ChartContainer
              config={{
                value: { label: "Count", color: "#60a5fa" },
              }}
              className="h-full w-full min-h-[250px] flex justify-center items-center"
            >
              <PieChart width={250} height={250}>
                <Pie
                  data={[
                    {
                      name: "Stars",
                      value: repoOverview.total_stars,
                      fill: "#F5EFE6",
                    },
                    {
                      name: "Forks",
                      value: repoOverview.total_forks,
                      fill: "#D25D5D",
                    },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  paddingAngle={4}
                  cornerRadius={5}
                  stroke="none"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend
                  iconSize={10}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <ChartFallback />
          )}
        </CardContent>

        <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
          <div className="flex gap-2 leading-none font-medium">
            Ratio: {starsPerForkRatio}:1
            <Star className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            {repoOverview.total_stars > repoOverview.total_forks * 3
              ? "High popularity, lower engagement"
              : "Balanced popularity and engagement"}
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default StarsFork;
