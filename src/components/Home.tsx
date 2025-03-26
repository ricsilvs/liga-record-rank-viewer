import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { cn, fetchRankings, parseHtmlToJson, Team } from "../lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Home: React.FC = () => {
  const [teams, setTeams] = useState<string[]>([]);
  const [ranking, setRanking] = useState<Team[]>([]);
  const [roundRanking, setRoundRanking] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRound, setSelectedRound] = useState("0");

  const handleChange = (value: string) => {
    setSelectedRound(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://liga.record.pt/common/services/teamsleague_page.ashx?guid=7ed55a3e-4496-4608-bc61-d6b1c2e16890&page=1&pagesize=50&mode_ranking=&type_ranking="
        );
        const ranking = parseHtmlToJson(response.data);
        setTeams(ranking.map((t) => t.name));
        setRanking(ranking);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (teams && selectedRound !== "0") {
      const fetchData = async () => {
        setLoading(true);
        setRoundRanking(await fetchRankings(teams, selectedRound));
        setLoading(false);
      };

      fetchData();
    }
  }, [teams, selectedRound]);

  const viewRanking = useMemo(
    () => (selectedRound === "0" ? ranking : roundRanking),
    [selectedRound, ranking, roundRanking]
  );

  const viewRankingRound = useMemo(
    () => ([] as Team[]).concat(viewRanking),
    [viewRanking]
  );

  return (
    <div className="flex flex-col gap-4 items-center">
      {loading ? (
        <>Loading</>
      ) : (
        <>
          <Select value={selectedRound} onValueChange={handleChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 35 }, (_, i) => `${i}`).map((round) => (
                <SelectItem key={round} value={round}>
                  {round === "0" ? "Total" : "Round " + round}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Position</TableHead>
                <TableHead className="text-center">Team Name</TableHead>
                <TableHead className="text-center">User</TableHead>
                <TableHead className="text-center">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewRanking.map((team, index) => (
                <TableRow
                  key={index}
                  className={cn({
                    "bg-red-500 hover:bg-red-600":
                      selectedRound !== "0" && index >= 23,
                    "bg-red-300 hover:bg-red-400":
                      selectedRound !== "0" && index >= 19 && index < 23,
                    "bg-red-100 hover:bg-red-200":
                      selectedRound !== "0" && index >= 14 && index < 19,
                  })}
                >
                  <TableCell className="text-center">{team.position}</TableCell>
                  <TableCell className="text-center">{team.name}</TableCell>
                  <TableCell className="text-center">{team.user}</TableCell>
                  <TableCell className="text-center">{team.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {selectedRound !== "0" && viewRanking && (
            <>
              <div className="text-xl lg:text-4xl">Total Score Round</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Position</TableHead>
                    <TableHead className="text-center">Team Name</TableHead>
                    <TableHead className="text-center">User</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewRankingRound
                    .sort(
                      (a, b) =>
                        ((a?.totalPosition ?? 0) as number) -
                        ((b?.totalPosition ?? 0) as number)
                    )
                    .map((t, index) => ({ ...t, position: `${index + 1}` }))
                    .map((team, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center">
                          {team.position}
                        </TableCell>
                        <TableCell className="text-center">
                          {team.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {team.user}
                        </TableCell>
                        <TableCell className="text-center">
                          {team.totalPoints}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
