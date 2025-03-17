import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Team = {
  position: string;
  totalPosition?: string;
  name: string;
  user: string;
  points: number;
  totalPoints?: number;
};

export function parseHtmlToJson(htmlString: string): Team[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const teams: Team[] = [];

  const articles = doc.querySelectorAll(".row_equipa");

  articles.forEach((article) => {
    const position =
      article.querySelector(".posicao")?.textContent?.trim() ?? "";
    const name = article.querySelector(".nome")?.textContent?.trim() ?? "";
    const user = article.querySelector(".user")?.textContent?.trim() ?? "";
    const pointsText =
      article
        .querySelector(".pontos_equipa")
        ?.textContent?.replace("pts", "")
        .trim() ?? "0";
    const points = parseInt(pointsText, 10);

    teams.push({ position, name, user, points });
  });

  return teams;
}

export const fetchRankings = async (teams: string[], round: string) => {
  const baseUrl =
    "https://liga.record.pt/common/services/teams_getranking_search.ashx";

  const results = await Promise.all(
    teams.map(async (team) => {
      const url = `${baseUrl}?page=1&pagesize=10&round=${round}&type=total&team=${encodeURIComponent(
        team
      )}&sex=&region=&club=&getpagecount=1`;
      const response = await fetch(url);
      return response.json();
    })
  );

  console.log(results);

  const formattedTeams: Team[] = results
    // .flatMap((result) => result[0]?.Teams || [])  //'No Fear ', user: 'LBastos' might need to be changed
    .flatMap((result) => result[0]?.Teams[0] || [])
    .map((team) => ({
      position: team.PositionRound,
      totalPosition: team.Position,
      name: team.NameTeam || "Unknown",
      user: team.NameUser || "Unknown",
      points: Number(team.PointsRound),
      totalPoints: team.PointsTotal,
    }))
    .sort((a, b) => a.position - b.position)
    .map((t, index) => ({ ...t, position: `${index + 1}` }));

  return formattedTeams;
};
