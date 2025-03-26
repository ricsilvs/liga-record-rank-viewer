"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts";
import { useRankings } from "../context/rankings";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useState } from "react";
import { Payload } from "recharts/types/component/DefaultLegendContent";

interface ChartDataPoint {
  round: string;
  [key: string]: string | number | null; // For dynamic team positions
}

function sanitizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-") // Replace any non-alphanumeric chars with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single one
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

export function PositionsChart() {
  const { rankings, loading, teams: trackedTeams } = useRankings();
  const [hiddenTeams, setHiddenTeams] = useState<Set<string>>(new Set());

  if (loading) {
    return <div>Loading chart data...</div>;
  }

  // Transform rankings data for the chart, sorting by totalPosition for each round
  const chartData = Object.entries(rankings)
    .map(([round, teams]): ChartDataPoint => {
      const dataPoint: ChartDataPoint = { round: `Round ${round}` };

      // Sort teams by totalPosition and assign positions based on sorted index
      const sortedTeams = [...teams]
        .sort(
          (a, b) =>
            ((a?.totalPosition ?? 0) as number) -
            ((b?.totalPosition ?? 0) as number)
        )
        .map((t, index) => ({ ...t, position: `${index + 1}` }));

      // Add position for each tracked team
      trackedTeams.forEach((teamName) => {
        const team = sortedTeams.find((t) => t.name.startsWith(teamName));
        dataPoint[teamName] = team ? parseInt(team.position) : null;
      });

      return dataPoint;
    })
    .filter(
      (r) =>
        Object.keys(r).every((key) => r[key] !== null) && r.round !== "Round 0"
    );

  // Create dynamic chart config based on tracked teams
  const chartConfig = trackedTeams.reduce((acc, team, index) => {
    const sanitizedName = sanitizeTeamName(team);
    acc[sanitizedName] = {
      color: `hsl(var(--chart-${index + 1}))`,
      label: team,
    };
    return acc;
  }, {} as ChartConfig);

  const handleLegendClick = (entry: Payload) => {
    const dataKey = entry?.dataKey;
    if (typeof dataKey === "string") {
      setHiddenTeams((prev) => {
        const newHidden = new Set(prev);
        if (newHidden.has(dataKey)) {
          newHidden.delete(dataKey);
        } else {
          newHidden.add(dataKey);
        }
        return newHidden;
      });
    }
  };

  return (
    <div className="w-full h-[500px]">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="round"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            reversed
            domain={[1, trackedTeams.length]}
          />
          <Legend onClick={handleLegendClick} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          {trackedTeams.map((team) => (
            <Line
              key={team}
              dataKey={team}
              type="linear"
              stroke={`hsl(var(--chart-${trackedTeams.indexOf(team) + 1}))`}
              strokeWidth={2}
              dot={false}
              hide={hiddenTeams.has(team)}
              // connectNulls
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
