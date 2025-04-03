import React from "react";
import { PositionsChart } from "./PositionsChart";
import { useRankings } from "@/context/rankings";
import LoadingState from "./LoadingState";

const Analytics: React.FC = () => {
  const { rankings, loading, teams, progress } = useRankings();

  return (
    <div className="flex flex-col gap-4 items-center">
      {loading ? (
        <LoadingState progress={progress} />
      ) : (
        <>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <PositionsChart rankings={rankings} trackedTeams={teams} />
        </>
      )}
    </div>
  );
};

export default Analytics;
