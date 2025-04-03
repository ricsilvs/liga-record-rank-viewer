import { createContext, useContext } from "react";
import { Team } from "../lib/utils";

export interface RankingsContextType {
  teams: string[];
  rankings: Record<string, Team[]>;
  loading: boolean;
  error: string | null;
  progress: number;
}

export const RankingsContext = createContext<RankingsContextType | undefined>(
  undefined
);

export const useRankings = () => {
  const context = useContext(RankingsContext);
  if (context === undefined) {
    throw new Error("useRankings must be used within a RankingsProvider");
  }
  return context;
};
