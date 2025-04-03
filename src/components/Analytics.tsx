import React from "react";
import { PositionsChart } from "./PositionsChart";
import { FirstPlacesChart } from "./FirstPlacesChart";
import { useRankings } from "@/context/rankings";
import LoadingState from "./LoadingState";

const Analytics: React.FC = () => {
  const { rankings, loading, teams, progress } = useRankings();

  return (
    <div className="flex flex-col gap-8 items-center">
      {loading ? (
        <LoadingState progress={progress} />
      ) : (
        <>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <div className="w-full space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Position History</h2>
              <PositionsChart rankings={rankings} trackedTeams={teams} />
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">
                First Places Distribution
              </h2>
              <FirstPlacesChart rankings={rankings} trackedTeams={teams} />
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
