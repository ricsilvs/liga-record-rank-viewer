import { useMemo, useState } from "react";
import { cn } from "../lib/utils";
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
import { useRankings } from "@/context/rankings";
import LoadingState from "./LoadingState";

const Home: React.FC = () => {
  const { rankings, loading, progress } = useRankings();
  const [selectedRound, setSelectedRound] = useState("0");

  const handleChange = (value: string) => {
    setSelectedRound(value);
  };

  const viewRanking = useMemo(
    () => rankings[selectedRound] || [],
    [selectedRound, rankings]
  );

  const viewRankingRound = useMemo(
    () => ([] as typeof viewRanking).concat(viewRanking),
    [viewRanking]
  );

  return (
    <div className="flex flex-col gap-4 items-center">
      {loading ? (
        <LoadingState progress={progress} />
      ) : (
        <>
          <Select value={selectedRound} onValueChange={handleChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 31 }, (_, i) => `${i}`).map((round) => (
                <SelectItem
                  key={round}
                  value={round}
                  disabled={rankings[round].every((team) =>
                    isNaN(Number(team.totalPoints))
                  )}
                >
                  {round === "0" ? "Total" : "Round " + round}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center p-1 md:p-2 text-xs md:text-sm w-12 md:w-auto">
                  <span className="hidden md:inline">Position</span>
                  <span className="inline md:hidden">Pos</span>
                </TableHead>
                <TableHead className="text-center p-1 md:p-2 text-xs md:text-sm">
                  Team Name
                </TableHead>
                <TableHead className="text-center p-1 md:p-2 text-xs md:text-sm">
                  User
                </TableHead>
                <TableHead className="text-center p-1 md:p-2 text-xs md:text-sm">
                  Points
                </TableHead>
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
                  <TableCell className="text-center p-1 md:p-2 text-xs md:text-sm">
                    {team.position}
                  </TableCell>
                  <TableCell className="text-center p-1 md:p-2 text-xs md:text-sm">
                    {team.name}
                  </TableCell>
                  <TableCell className="text-center p-1 md:p-2 text-xs md:text-sm">
                    {team.user}
                  </TableCell>
                  <TableCell className="text-center p-1 md:p-2 text-xs md:text-sm">
                    {team.points}
                  </TableCell>
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
                    <TableHead className="text-center p-1 md:p-2 text-xs md:text-sm w-12 md:w-auto">
                      <span className="hidden md:inline">Position</span>
                      <span className="inline md:hidden">Pos</span>
                    </TableHead>
                    <TableHead className="text-center p-1 md:p-2 text-xs md:text-sm">
                      Team Name
                    </TableHead>
                    <TableHead className="text-center p-1 md:p-2 text-xs md:text-sm">
                      User
                    </TableHead>
                    <TableHead className="text-center p-1 md:p-2 text-xs md:text-sm">
                      Points
                    </TableHead>
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
                        <TableCell className="text-center p-1 md:p-2 text-xs md:text-sm">
                          {team.position}
                        </TableCell>
                        <TableCell className="text-center p-1 md:p-2 text-xs md:text-sm">
                          {team.name}
                        </TableCell>
                        <TableCell className="text-center p-1 md:p-2 text-xs md:text-sm">
                          {team.user}
                        </TableCell>
                        <TableCell className="text-center p-1 md:p-2 text-xs md:text-sm">
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
