import React, { useEffect, useState } from "react";
import axios from "axios";
import { Team, fetchRankings, parseHtmlToJson } from "../lib/utils";
import { RankingsContext } from "./rankings";

const BATCH_SIZE = 10; // Number of rounds to fetch at once

export const RankingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [teams, setTeams] = useState<string[]>([]);
  const [rankings, setRankings] = useState<Record<string, Team[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        // Fetch initial data to get teams
        const response = await axios.get(
          "https://liga.record.pt/common/services/teamsleague_page.ashx?guid=7ed55a3e-4496-4608-bc61-d6b1c2e16890&page=1&pagesize=50&mode_ranking=&type_ranking="
        );
        const initialRanking = parseHtmlToJson(response.data);
        const teamNames = initialRanking.map((t) => t.name);
        setTeams(teamNames);
        setRankings({ "0": initialRanking });
        setProgress(1);

        // Fetch rankings for all rounds in batches
        const rounds = Array.from({ length: 30 }, (_, i) => i + 1);

        for (let i = 0; i < rounds.length; i += BATCH_SIZE) {
          const batch = rounds.slice(i, i + BATCH_SIZE);

          // Process each batch in parallel with a small delay between requests
          const batchPromises = batch.map(async (round, index) => {
            // Add a small delay between requests in the same batch
            if (index > 0) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
            try {
              const roundRanking = await fetchRankings(
                teamNames,
                round.toString()
              );
              return { round: round.toString(), ranking: roundRanking };
            } catch (err) {
              console.error(`Failed to fetch round ${round}:`, err);
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          const validResults = batchResults.filter(
            (result): result is { round: string; ranking: Team[] } =>
              result !== null
          );

          setRankings((prev) => {
            const newRankings = { ...prev };
            validResults.forEach(({ round, ranking }) => {
              newRankings[round] = ranking;
            });
            return newRankings;
          });

          setProgress(
            Math.min(Math.floor(((i + BATCH_SIZE) / rounds.length) * 100), 50)
          );

          // Reduced delay between batches
          if (i + BATCH_SIZE < rounds.length) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }
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
