export interface TournamentResult {
  team_name: string
  total_points: number
  wins: number
  second_places: number
  third_places: number
  total_tournaments: number
  division: string
  region: string
  tournaments: Array<{
    name: string
    ranking: string
    points: number
  }>
  mvp_awards: string[]
  coaches: string[]
}

export interface ComprehensiveTournamentData {
  tournaments: Record<string, number>
  teams: TournamentResult[]
  total_teams: number
  total_tournaments: number
}

export class ComprehensiveVolleyballDataManager {
  private data: ComprehensiveTournamentData | null = null

  constructor() {
    this.loadData()
  }

  private async loadData() {
    try {
      const response = await fetch("/tournament_results.json")
      if (response.ok) {
        this.data = await response.json()
        console.log("[v0] Loaded comprehensive tournament data:", this.data?.total_teams, "teams")
      } else {
        console.log("[v0] Using fallback data structure")
        this.data = this.getFallbackData()
      }
    } catch (error) {
      console.error("[v0] Error loading tournament data:", error)
      this.data = this.getFallbackData()
    }
  }

  private getFallbackData(): ComprehensiveTournamentData {
    return {
      tournaments: {},
      teams: [],
      total_teams: 0,
      total_tournaments: 0,
    }
  }

  getAllTeams(): TournamentResult[] {
    return this.data?.teams || []
  }

  getTeamsByDivision(division: string): TournamentResult[] {
    return this.getAllTeams().filter((team) => team.division.includes(division) || division === "전체")
  }

  getTeamsByRegion(region: string): TournamentResult[] {
    return this.getAllTeams().filter((team) => team.region === region || region === "전체")
  }

  searchTeams(query: string): TournamentResult[] {
    const searchTerm = query.toLowerCase()
    return this.getAllTeams().filter(
      (team) =>
        team.team_name.toLowerCase().includes(searchTerm) ||
        team.division.toLowerCase().includes(searchTerm) ||
        team.region.toLowerCase().includes(searchTerm),
    )
  }

  getRegionalRankings(): Record<string, TournamentResult[]> {
    const regions = ["수도권", "강원권", "충청권", "전라권", "경상권", "제주권"]
    const rankings: Record<string, TournamentResult[]> = {}

    regions.forEach((region) => {
      rankings[region] = this.getTeamsByRegion(region).sort((a, b) => b.total_points - a.total_points)
    })

    return rankings
  }

  getDivisionRankings(): Record<string, TournamentResult[]> {
    const divisions = [
      "남자클럽1부",
      "남자클럽2부",
      "남자클럽3부",
      "여자클럽1부",
      "여자클럽2부",
      "여자클럽3부",
      "남자대학부",
      "여자대학부",
    ]
    const rankings: Record<string, TournamentResult[]> = {}

    divisions.forEach((division) => {
      rankings[division] = this.getTeamsByDivision(division).sort((a, b) => b.total_points - a.total_points)
    })

    return rankings
  }

  getTournamentSummary(): Record<string, number> {
    return this.data?.tournaments || {}
  }

  getTotalStats() {
    return {
      total_teams: this.data?.total_teams || 0,
      total_tournaments: this.data?.total_tournaments || 0,
      total_matches: this.getAllTeams().reduce((sum, team) => sum + team.total_tournaments, 0),
    }
  }
}

export const comprehensiveDataManager = new ComprehensiveVolleyballDataManager()
