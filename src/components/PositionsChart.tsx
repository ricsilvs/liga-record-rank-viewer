"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useState } from "react";
// import { Payload } from "recharts/types/component/DefaultLegendContent";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { MultiSelect } from "./ui/multi-select";
import { Team } from "@/lib/utils";

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

export function PositionsChart({
  rankings,
  trackedTeams,
}: {
  rankings: Record<string, Team[]>;
  trackedTeams: string[];
}) {
  const [visibleTeams, setVisibleTeams] = useState<Set<string>>(
    new Set(trackedTeams)
  );
  const isMobile = useMediaQuery("(max-width: 768px)");

  console.log(visibleTeams);

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

  // const handleLegendClick = (entry: Payload) => {
  //   const dataKey = entry?.dataKey;
  //   if (typeof dataKey === "string") {
  //     setVisibleTeams((prev) => {
  //       const newVisible = new Set(prev);
  //       if (newVisible.has(dataKey)) {
  //         newVisible.delete(dataKey);
  //       } else {
  //         newVisible.add(dataKey);
  //       }
  //       return newVisible;
  //     });
  //   }
  // };

  return (
    <>
      <MultiSelect
        options={trackedTeams.map((team) => ({
          label: team,
          value: team,
        }))}
        onValueChange={(value) => {
          setVisibleTeams(new Set(value));
        }}
        defaultValue={Array.from(visibleTeams)}
        value={Array.from(visibleTeams)}
        placeholder="Select teams"
        // variant="inverted"
        // animation={2}
        // maxCount={3}
        className="max-w-[800px]"
      />
      <div className={`w-full ${isMobile ? "h-[400px]" : "h-[500px]"}`}>
        <ChartContainer config={chartConfig} className="w-full h-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={
              isMobile
                ? {
                    top: 10,
                    right: 5,
                    bottom: 20,
                    left: -20,
                  }
                : {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 0,
                  }
            }
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="round"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={isMobile ? 2 : 0}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={isMobile ? 4 : 8}
              reversed
              domain={[1, trackedTeams.length]}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 20 : 30}
            />
            {/* {!isMobile && <Legend onClick={handleLegendClick} />} */}
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {trackedTeams.map((team) => (
              <Line
                key={team}
                dataKey={team}
                type="linear"
                stroke={`hsl(var(--chart-${trackedTeams.indexOf(team) + 1}))`}
                strokeWidth={isMobile ? 1 : 2}
                dot={false}
                hide={!visibleTeams.has(team)}
                // connectNulls
              />
            ))}
          </LineChart>
        </ChartContainer>
      </div>
    </>
  );
}
