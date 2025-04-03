import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Team, fetchRankings, parseHtmlToJson } from "../lib/utils";
import { RankingsContext } from "./rankings";

const BATCH_SIZE = 15; // Increased batch size for rounds

export const RankingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [teams, setTeams] = useState<string[]>([]);
  const [rankings, setRankings] = useState<Record<string, Team[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const completedRequestsRef = useRef(0);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);
        completedRequestsRef.current = 0;

        // Fetch initial data to get teams
        const response = await axios.get(
          "https://liga.record.pt/common/services/teamsleague_page.ashx?guid=7ed55a3e-4496-4608-bc61-d6b1c2e16890&page=1&pagesize=50&mode_ranking=&type_ranking="
        );
        const initialRanking = parseHtmlToJson(response.data);
        const teamNames = initialRanking.map((t) => t.name);
        setTeams(teamNames);
        setRankings({ "0": initialRanking });
        setProgress(5); // Initial data fetch is 5% of total progress

        // Fetch rankings for all rounds in batches
        const rounds = Array.from({ length: 30 }, (_, i) => i + 1);
        const allRankings: Record<string, Team[]> = { "0": initialRanking };

        // Calculate total number of requests
        const totalRequests = rounds.length;

        for (let i = 0; i < rounds.length; i += BATCH_SIZE) {
          const batch = rounds.slice(i, i + BATCH_SIZE);

          // Process each batch in parallel
          const batchPromises = batch.map(async (round) => {
            try {
              const roundRanking = await fetchRankings(
                teamNames,
                round.toString()
              );
              // Update progress after each round completes (5% to 95%)
              completedRequestsRef.current += 1;
              const progressValue =
                Math.floor(
                  (completedRequestsRef.current / totalRequests) * 90
                ) + 5;
              setProgress(Math.min(95, progressValue));
              return { round: round.toString(), ranking: roundRanking };
            } catch (err) {
              console.error(`Failed to fetch round ${round}:`, err);
              completedRequestsRef.current += 1;
              const progressValue =
                Math.floor(
                  (completedRequestsRef.current / totalRequests) * 90
                ) + 5;
              setProgress(Math.min(95, progressValue));
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          const validResults = batchResults.filter(
            (result): result is { round: string; ranking: Team[] } =>
              result !== null
          );

          validResults.forEach(({ round, ranking }) => {
            allRankings[round] = ranking;
          });

          setRankings(allRankings);
        }

        setProgress(100); // Final progress update
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch rankings"
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <RankingsContext.Provider
      value={{ teams, rankings, loading, error, progress }}
    >
      {children}
    </RankingsContext.Provider>
  );
};
