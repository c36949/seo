export interface TournamentResult {
  division: string
  rank: string
  teamName: string
  bestPlayer?: string
  coach?: string
}

export const tournamentResults: TournamentResult[] = [
  { division: "남자클럽 2부", rank: "우승", teamName: "서울 엄보스", bestPlayer: "윤성현", coach: "조영주" },
  { division: "남자클럽 2부", rank: "준우승", teamName: "용인 토이스토리" },
  { division: "남자클럽 2부", rank: "3위", teamName: "서울 NWN" },
  { division: "남자클럽 2부", rank: "3위", teamName: "서울 차차차" },
  { division: "남자클럽 3부", rank: "우승", teamName: "제천 JSVC", bestPlayer: "홍민석", coach: "홍미선" },
  { division: "남자클럽 3부", rank: "준우승", teamName: "서울 샤샤샤" },
  { division: "남자클럽 3부", rank: "3위", teamName: "용인 오합지존" },
  { division: "남자클럽 3부", rank: "3위", teamName: "남양주배구사랑" },
  { division: "남자클럽 3부", rank: "우승", teamName: "서울 DGZ", bestPlayer: "이준재", coach: "김량우" },
  { division: "남자클럽 3부", rank: "준우승", teamName: "서울 삼각산파워" },
  { division: "남자클럽 3부", rank: "3위", teamName: "남양주배구사랑" },
  { division: "남자클럽 3부", rank: "3위", teamName: "인천 라이크발리볼" },
  { division: "남자 대학부", rank: "우승", teamName: "국민대 VAT", bestPlayer: "신경록", coach: "황주현" },
  { division: "남자 대학부", rank: "준우승", teamName: "서울대 남자배구" },
  { division: "남자 대학부", rank: "3위", teamName: "건국대 아마배구" },
  { division: "남자 대학부", rank: "3위", teamName: "삼육대 SU-WINGS" },
  { division: "여자클럽 3부", rank: "우승", teamName: "세종 맥스", bestPlayer: "박세희", coach: "유부재" },
  { division: "여자클럽 3부", rank: "준우승", teamName: "서울 차차차" },
  { division: "여자클럽 3부", rank: "3위", teamName: "서울 우리하모니" },
  { division: "여자클럽 3부", rank: "3위", teamName: "서울 GVT" },
  { division: "여자 대학부", rank: "우승", teamName: "연세대 RECEIVE", bestPlayer: "박정현", coach: "김희진" },
  { division: "여자 대학부", rank: "준우승", teamName: "한국제대 KUV" },
  { division: "여자 대학부", rank: "3위", teamName: "서울대 여자배구" },
  { division: "여자 대학부", rank: "3위", teamName: "삼육대 SU-WINGS" },
]

export function getTeamsByDivision(division: string) {
  return tournamentResults.filter((result) => result.division === division)
}

export function getTeamRegion(teamName: string): string {
  if (teamName.includes("서울")) return "수도권"
  if (teamName.includes("용인") || teamName.includes("남양주") || teamName.includes("인천")) return "수도권"
  if (teamName.includes("제천")) return "충청권"
  if (teamName.includes("세종")) return "충청권"
  if (
    teamName.includes("국민대") ||
    teamName.includes("서울대") ||
    teamName.includes("건국대") ||
    teamName.includes("삼육대") ||
    teamName.includes("연세대") ||
    teamName.includes("한국제대")
  )
    return "수도권"
  return "기타"
}

export function calculateTeamStats(teamName: string) {
  const teamResults = tournamentResults.filter((result) => result.teamName === teamName)
  const gold = teamResults.filter((r) => r.rank === "우승").length
  const silver = teamResults.filter((r) => r.rank === "준우승").length
  const bronze = teamResults.filter((r) => r.rank === "3위").length

  return {
    gold,
    silver,
    bronze,
    total: gold + silver + bronze,
    totalScore: gold * 3 + silver * 2 + bronze * 1,
  }
}
