"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { Team } from "@/lib/utils";

interface PrizePoolData {
  team: string;
  amount: number;
  fill: string;
  percent?: number;
}

function sanitizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function calculatePrizeAmount(position: number): number {
  if (position >= 1 && position <= 14) return 0;
  if (position >= 15 && position <= 19) return 1;
  if (position >= 20 && position <= 23) return 2;
  if (position >= 24 && position <= 27) return 3;
  return 0;
}

const RADIAN = Math.PI / 180;

export function PrizePoolChart({
  rankings,
  trackedTeams,
}: {
  rankings: Record<string, Team[]>;
  trackedTeams: string[];
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Calculate total amount paid by each team
  const prizePoolData: PrizePoolData[] = trackedTeams
    .map((team, index) => {
      const totalAmount = Object.entries(rankings)
        .filter(([round]) => round !== "0") // Exclude total rankings
        .reduce((total, [, roundTeams]) => {
          const teamPosition =
            roundTeams.findIndex((t) => t.name.startsWith(team)) + 1;
          return total + calculatePrizeAmount(teamPosition);
        }, 0);

      return {
        team,
        amount: totalAmount,
        fill: `hsl(var(--chart-${index + 1}))`,
      };
    })
    .filter((team) => team.amount > 0);

  // Sort teams by amount paid
  const sortedData = [...prizePoolData].sort((a, b) => b.amount - a.amount);

  // Calculate percentages
  const totalAmount = sortedData.reduce((sum, item) => sum + item.amount, 0);
  sortedData.forEach((item) => {
    item.percent = item.amount / totalAmount;
  });

  // Create dynamic chart config based on tracked teams
  const chartConfig = trackedTeams.reduce((acc, team, index) => {
    const sanitizedName = sanitizeTeamName(team);
    acc[sanitizedName] = {
      color: `hsl(var(--chart-${index + 1}))`,
      label: team,
    };
    return acc;
  }, {} as ChartConfig);

  // Calculate total prize pool
  const totalPrizePool = sortedData.reduce((sum, team) => sum + team.amount, 0);

  return (
    <div className={`w-full `}>
      <div className="text-center mb-4">
        <span className="text-lg font-semibold">
          Total Prize Pool: {totalPrizePool}€
        </span>
      </div>
      <ChartContainer config={chartConfig} className="w-full h-full">
        <PieChart
          margin={
            isMobile
              ? { top: 10, right: 10, bottom: 10, left: 10 }
              : { top: 20, right: 20, bottom: 20, left: 20 }
          }
        >
          <Pie
            data={sortedData}
            dataKey="amount"
            nameKey="team"
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? "30%" : "40%"}
            outerRadius={isMobile ? "60%" : "70%"}
            paddingAngle={2}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              value,
              name,
              percent,
            }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              return (
                <text
                  x={x}
                  y={y}
                  fill="#666"
                  textAnchor={x > cx ? "start" : "end"}
                  dominantBaseline="central"
                  style={{ fontSize: isMobile ? 10 : 12 }}
                >
                  {`${name} (${value}€${
                    !isMobile ? ` ${(percent * 100).toFixed(0)}%)` : ")"
                  }`}
                </text>
              );
            }}
          >
            {sortedData.map((entry) => (
              <Cell key={entry.team} fill={entry.fill} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
