import React from "react";
import { PositionsChart } from "./PositionsChart";

const Analytics: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 items-center">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <PositionsChart />
    </div>
  );
};

export default Analytics;
