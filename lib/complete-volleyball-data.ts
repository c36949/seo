export interface CompleteTeamData {
  name: string
  division: string
  main_region: string
  detailed_region: string
  gold_medals: number
  silver_medals: number
  bronze_medals: number
  total_score: number
  division_rank: number
  tournaments_participated: number
  achievements: string[]
  regional_rank?: number
}

export interface TournamentResults {
  total_teams: number
  divisions: string[]
  regions: string[]
  division_rankings: Record<string, CompleteTeamData[]>
  summary: {
    divisions_count: number
    regions_count: number
    teams_per_division: Record<string, number>
  }
}

export class CompleteVolleyballDataManager {
  private data: TournamentResults | null = null

  constructor() {
    this.loadMockData() // Load comprehensive mock data until CSV is processed
  }

  private loadMockData() {
    const divisions = [
      "남자클럽 1부",
      "남자클럽 2부",
      "남자클럽 3부",
      "여자클럽 1부",
      "여자클럽 2부",
      "여자클럽 3부",
      "남자대학부",
      "여자대학부",
      "남자고등부",
      "여자고등부",
      "중학부",
    ]

    const regions = ["수도권", "강원권", "충청권", "전라권", "경상권", "제주권"]

    const teamCounts = {
      "남자클럽 1부": 45,
      "남자클럽 2부": 67,
      "남자클럽 3부": 93,
      "여자클럽 1부": 38,
      "여자클럽 2부": 52,
      "여자클럽 3부": 90,
      남자대학부: 32,
      여자대학부: 28,
      남자고등부: 156,
      여자고등부: 134,
      중학부: 89,
    }

    const division_rankings: Record<string, CompleteTeamData[]> = {}

    divisions.forEach((division) => {
      const teamCount = teamCounts[division as keyof typeof teamCounts] || 50
      const teams: CompleteTeamData[] = []

      for (let i = 1; i <= teamCount; i++) {
        const region = regions[Math.floor(Math.random() * regions.length)]
        const goldMedals = Math.max(0, Math.floor(Math.random() * 5) - (i > 10 ? 3 : 0))
        const silverMedals = Math.max(0, Math.floor(Math.random() * 4) - (i > 20 ? 2 : 0))
        const bronzeMedals = Math.max(0, Math.floor(Math.random() * 3) - (i > 30 ? 1 : 0))

        teams.push({
          name: `${region} ${division.includes("남자") ? "남자" : division.includes("여자") ? "여자" : ""}팀 ${i}`,
          division,
          main_region: region,
          detailed_region: `${region} 세부지역 ${Math.floor(Math.random() * 5) + 1}`,
          gold_medals: goldMedals,
          silver_medals: silverMedals,
          bronze_medals: bronzeMedals,
          total_score: goldMedals * 5 + silverMedals * 3 + bronzeMedals * 1,
          division_rank: i,
          tournaments_participated: Math.floor(Math.random() * 8) + 3,
          achievements: goldMedals > 0 ? [`${division} 우승 ${goldMedals}회`] : [],
        })
      }

      // Sort by total score
      teams.sort((a, b) => b.total_score - a.total_score)
      teams.forEach((team, index) => {
        team.division_rank = index + 1
      })

      division_rankings[division] = teams
    })

    this.data = {
      total_teams: Object.values(teamCounts).reduce((sum, count) => sum + count, 0),
      divisions,
      regions,
      division_rankings,
      summary: {
        divisions_count: divisions.length,
        regions_count: regions.length,
        teams_per_division: teamCounts,
      },
    }
  }

  getAllTeams(): CompleteTeamData[] {
    if (!this.data) return []
    return Object.values(this.data.division_rankings).flat()
  }

  getTeamsByDivision(division: string): CompleteTeamData[] {
    if (!this.data || !this.data.division_rankings[division]) return []
    return this.data.division_rankings[division]
  }

  getTeamsByRegion(region: string): CompleteTeamData[] {
    return this.getAllTeams().filter((team) => team.main_region === region)
  }

  getDivisions(): string[] {
    return this.data?.divisions || []
  }

  getRegions(): string[] {
    return this.data?.regions || []
  }

  getTeamCount(division?: string): number {
    if (division) {
      return this.data?.summary.teams_per_division[division] || 0
    }
    return this.data?.total_teams || 0
  }

  searchTeams(query: string): CompleteTeamData[] {
    const allTeams = this.getAllTeams()
    return allTeams.filter(
      (team) =>
        team.name.toLowerCase().includes(query.toLowerCase()) ||
        team.division.toLowerCase().includes(query.toLowerCase()) ||
        team.main_region.toLowerCase().includes(query.toLowerCase()),
    )
  }
}

export const completeDataManager = new CompleteVolleyballDataManager()
