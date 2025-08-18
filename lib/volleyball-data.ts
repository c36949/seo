export interface Team {
  id: string
  team_name: string
  division: string
  region: string
  wins: number
  runner_ups: number
  third_places: number
  total_medals: number
  ranking_score: number
}

export interface TeamDetails {
  achievements: string[]
  logo: string
  description: string
  location: string
  founded: string
  contact: string
}

export interface VolleyballDatabase {
  teams: Team[]
  divisions: string[]
  regions: string[]
  division_counts: Record<string, number>
  region_counts: Record<string, number>
  team_details: Record<string, TeamDetails>
  metadata: {
    total_teams: number
    last_updated: string
    season: string
  }
}

export class VolleyballDataManager {
  private data: VolleyballDatabase | null = null

  async loadData(): Promise<VolleyballDatabase> {
    if (this.data) {
      return this.data
    }

    try {
      const sampleData: VolleyballDatabase = {
        teams: [
          {
            id: "서울_스파이커스_남자클럽3부",
            team_name: "서울 스파이커스",
            division: "남자클럽3부",
            region: "수도권",
            wins: 5,
            runner_ups: 3,
            third_places: 2,
            total_medals: 10,
            ranking_score: 28,
          },
          {
            id: "부산_네트워크_남자클럽3부",
            team_name: "부산 네트워크",
            division: "남자클럽3부",
            region: "경상권",
            wins: 4,
            runner_ups: 4,
            third_places: 1,
            total_medals: 9,
            ranking_score: 25,
          },
          {
            id: "광주_볼리볼_남자클럽3부",
            team_name: "광주 볼리볼",
            division: "남자클럽3부",
            region: "전라권",
            wins: 3,
            runner_ups: 2,
            third_places: 4,
            total_medals: 9,
            ranking_score: 20,
          },
          {
            id: "서울_여자배구_여자클럽3부",
            team_name: "서울 여자배구",
            division: "여자클럽3부",
            region: "수도권",
            wins: 6,
            runner_ups: 2,
            third_places: 1,
            total_medals: 9,
            ranking_score: 27,
          },
          {
            id: "연세대학교_남자대학부",
            team_name: "연세대학교",
            division: "남자대학부",
            region: "수도권",
            wins: 4,
            runner_ups: 1,
            third_places: 0,
            total_medals: 5,
            ranking_score: 14,
          },
        ],
        divisions: [
          "남자클럽3부",
          "여자클럽3부",
          "남자장년부",
          "여자장년부",
          "남자시니어부",
          "남자실버부",
          "남자대학부",
          "여자대학부",
          "남자국제부",
          "여자국제부",
        ],
        regions: ["수도권", "충청권", "강원권", "전라권", "경상권", "제주권"],
        division_counts: {
          남자클럽3부: 93,
          여자클럽3부: 90,
          남자장년부: 45,
          여자장년부: 38,
          남자시니어부: 32,
          남자실버부: 28,
          남자대학부: 24,
          여자대학부: 22,
          남자국제부: 18,
          여자국제부: 16,
        },
        region_counts: {
          수도권: 156,
          경상권: 98,
          전라권: 67,
          충청권: 54,
          강원권: 23,
          제주권: 12,
        },
        team_details: {
          서울_스파이커스_남자클럽3부: {
            achievements: ["2024 전국대회 우승 5회", "2024 전국대회 준우승 3회", "2024 전국대회 3위 2회"],
            logo: "/placeholder.svg?height=100&width=100&text=서울",
            description: "서울 스파이커스는 수도권 지역의 남자클럽3부 소속 배구팀입니다.",
            location: "수도권",
            founded: "2020년",
            contact: "연락처 정보 없음",
          },
        },
        metadata: {
          total_teams: 410,
          last_updated: "2024-01-01",
          season: "2024",
        },
      }

      this.data = sampleData
      return sampleData
    } catch (error) {
      console.error("Error loading volleyball data:", error)
      throw error
    }
  }

  getRankedTeams(teams: Team[], division?: string, region?: string): Team[] {
    return teams
      .filter((team) => {
        if (division && division !== "전체" && team.division !== division) return false
        if (region && region !== "전체" && team.region !== region) return false
        return true
      })
      .sort((a, b) => {
        if (a.wins !== b.wins) return b.wins - a.wins
        if (a.runner_ups !== b.runner_ups) return b.runner_ups - a.runner_ups
        if (a.third_places !== b.third_places) return b.third_places - a.third_places
        return a.team_name.localeCompare(b.team_name)
      })
  }

  getTeamsByRegion(teams: Team[], region: string): Team[] {
    return this.getRankedTeams(teams.filter((team) => team.region === region))
  }

  getTeamsByDivision(teams: Team[], division: string): Team[] {
    return this.getRankedTeams(teams.filter((team) => team.division === division))
  }

  getTeamDetails(teamId: string): TeamDetails | null {
    return this.data?.team_details[teamId] || null
  }

  getRegionStats(teams: Team[], region: string) {
    const regionTeams = teams.filter((team) => team.region === region)
    return {
      totalTeams: regionTeams.length,
      totalWins: regionTeams.reduce((sum, team) => sum + team.wins, 0),
      totalMedals: regionTeams.reduce((sum, team) => sum + team.total_medals, 0),
      topTeam: regionTeams.sort((a, b) => b.ranking_score - a.ranking_score)[0],
    }
  }

  getDivisionStats(teams: Team[], division: string) {
    const divisionTeams = teams.filter((team) => team.division === division)
    return {
      totalTeams: divisionTeams.length,
      totalWins: divisionTeams.reduce((sum, team) => sum + team.wins, 0),
      totalMedals: divisionTeams.reduce((sum, team) => sum + team.total_medals, 0),
      topTeam: divisionTeams.sort((a, b) => b.ranking_score - a.ranking_score)[0],
    }
  }

  getTeamRegionalRank(teams: Team[], team: Team): number {
    const regionTeams = this.getTeamsByRegion(teams, team.region)
    return regionTeams.findIndex((t) => t.id === team.id) + 1
  }

  getTeamDivisionRank(teams: Team[], team: Team): number {
    const divisionTeams = this.getTeamsByDivision(teams, team.division)
    return divisionTeams.findIndex((t) => t.id === team.id) + 1
  }

  getTeamOverallRank(teams: Team[], team: Team): number {
    const allTeams = this.getRankedTeams(teams)
    return allTeams.findIndex((t) => t.id === team.id) + 1
  }
}

export const dataManager = new VolleyballDataManager()
