import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Code } from "lucide-react";
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

const languageChartConfig = {
  bytes: { label: "Bytes" },
  TypeScript: { label: "TypeScript", color: "#3178c6" },
  JavaScript: { label: "JavaScript", color: "#f7df1e" },
  Python: { label: "Python", color: "#3776ab" },
  Java: { label: "Java", color: "#b07219" },
  CSS: { label: "CSS", color: "#264de4" },
  HTML: { label: "HTML", color: "#e34c26" },
};

const ChartFallback = () => (
  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
    <p className="text-sm">Data not available</p>
  </div>
);

const ContributorDistribution = ({ languages }) => {
  // Dominant Language and Percentage
  const dominantLanguage = useMemo(() => {
    if (!languages?.language_composition) return { name: "N/A", percent: 0 };

    const composition = languages.language_composition as Record<
      string,
      number
    >;
    const total = Object.values(composition).reduce((a, b) => a + b, 0);
    const entries = Object.entries(composition);
    const [name, bytes] = entries.reduce(
      (max, curr) => (curr[1] > max[1] ? curr : max),
      entries[0]
    );

    return {
      name,
      percent: ((bytes / total) * 100).toFixed(1),
    };
  }, [languages]);

  // Language Diversity Index
  const languageDiversityIndex = useMemo(() => {
    if (!languages?.language_composition) return 0;

    const composition = languages.language_composition as Record<
      string,
      number
    >;
    const total = Object.values(composition).reduce((a, b) => a + b, 0);

    return Object.values(composition).filter(
      (bytes) => (bytes / total) * 100 > 1
    ).length;
  }, [languages]);

  // Language Data for Chart
  const languageData = useMemo(() => {
    if (!languages?.language_composition) return [];

    const composition = languages.language_composition as Record<
      string,
      number
    >;
    const total = Object.values(composition).reduce(
      (sum, bytes) => sum + bytes,
      0
    );

    const colorMap: Record<string, string> = {
      TypeScript: "#3178c6",
      JavaScript: "#f7df1e",
      Python: "#3776ab",
      Java: "#b07219",
      CSS: "#264de4",
      HTML: "#e34c26",
      Ruby: "#CC342D",
      Go: "#00ADD8",
      Rust: "#dea584",
      PHP: "#4F5D95",
      "C++": "#f34b7d",
      CoffeeScript: "#244776",
      C: "#555555",
      Shell: "#89e051",
      Makefile: "#427819",
    };

    return Object.entries(composition)
      .map(([name, bytes]) => ({
        name,
        value: Math.round((bytes / total) * 100),
        bytes,
        fill: colorMap[name] || "#94a3b8",
      }))
      .filter((lang) => lang.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [languages]);

  return (
    <>
      <Card className="bg-gradient-card border-border shadow-card flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-sm">Language Composition</CardTitle>
          <CardDescription>Codebase structure breakdown</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 pb-0">
          {languageData.length > 0 ? (
            <ChartContainer
              config={languageChartConfig}
              className="mx-auto aspect-square max-h-[280px] flex justify-center items-center"
            >
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={languageData.map((lang) => ({
                  metric: lang.name,
                  value: lang.value,
                }))}
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
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Radar
                  name="Languages"
                  dataKey="value"
                  stroke="#60a5fa"
                  fill="#a78bfa"
                  fillOpacity={0.5}
                />
                <Legend
                  iconSize={10}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </RadarChart>
            </ChartContainer>
          ) : (
            <ChartFallback />
          )}
        </CardContent>

        {languageData.length > 0 && (
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              {dominantLanguage.name} dominates at {dominantLanguage.percent}%
              <Code className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              {languageDiversityIndex} languages with &gt;1% share
            </div>
          </CardFooter>
        )}
      </Card>
    </>
  );
};

export default ContributorDistribution;
