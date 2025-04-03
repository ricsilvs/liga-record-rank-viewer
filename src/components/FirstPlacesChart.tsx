"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { Team } from "@/lib/utils";

interface FirstPlacesData {
  team: string;
  firstPlaces: number;
  fill: string;
}

function sanitizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function FirstPlacesChart({
  rankings,
  trackedTeams,
}: {
  rankings: Record<string, Team[]>;
  trackedTeams: string[];
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Calculate first places for each team
  const firstPlacesData: FirstPlacesData[] = trackedTeams
    .map((team, index) => {
      const firstPlaces = Object.entries(rankings)
        .filter(([round]) => round !== "0") // Exclude total rankings
        .reduce((count, [, roundTeams]) => {
          const isFirst = roundTeams[0]?.name.startsWith(team);
          return count + (isFirst ? 1 : 0);
        }, 0);

      return {
        team,
        firstPlaces,
        fill: `hsl(var(--chart-${index + 1}))`,
      };
    })
    .filter((team) => team.firstPlaces > 0);

  // Sort teams by number of first places
  const sortedData = [...firstPlacesData].sort(
    (a, b) => b.firstPlaces - a.firstPlaces
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

  return (
    <div className={`w-full ${isMobile ? "h-[400px]" : "h-[500px]"}`}>
      <ChartContainer config={chartConfig} className="w-full h-full">
        <BarChart
          data={sortedData}
          margin={
            isMobile
              ? {
                  top: 10,
                  right: 20,
                  bottom: 60,
                  left: 20,
                }
              : {
                  top: 20,
                  right: 30,
                  bottom: 70,
                  left: 30,
                }
          }
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="team"
            tickLine={false}
            axisLine={false}
            tickMargin={30}
            interval={0}
            tick={({ x, y, payload }) => (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={16}
                  textAnchor="end"
                  fill="#666"
                  transform="rotate(-45)"
                  style={{ fontSize: isMobile ? 10 : 12 }}
                >
                  {payload.value}
                </text>
              </g>
            )}
            height={80}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={isMobile ? 4 : 8}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            width={isMobile ? 30 : 40}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="firstPlaces" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
