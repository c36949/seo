// 전국 배구대회 결과 데이터 처리 시스템 - 데이터 제거된 버전

export interface TournamentResult {
  tournament: string
  division: string
  teamName: string
  rank: number // 1: 우승, 2: 준우승, 3: 3위
  region?: string
}

export interface TeamStats {
  teamName: string
  division: string
  region: string
  championships: number // 우승 횟수
  runnerUps: number // 준우승 횟수
  thirdPlaces: number // 3위 횟수
  totalScore: number // 순위 계산용 점수
  tournaments: TournamentResult[] // 상세 대회 기록
}

export interface DivisionTeamStats {
  teamName: string
  division: string
  region: string
  championships: number
  runnerUps: number
  thirdPlaces: number
  totalScore: number
  tournaments: TournamentResult[]
}

export class VolleyballDataProcessor {
  private results: TournamentResult[] = []
  private teamStats: Map<string, TeamStats> = new Map()
  private tournamentCount = 0
  private tournamentNames: string[] = []
  private tournamentDates: string[] = []

  // 지역 매핑
  private regionMapping = {
    수도권: [
      "서울",
      "인천",
      "경기",
      "고양",
      "성남",
      "수원",
      "안양",
      "부천",
      "의정부",
      "안산",
      "구리",
      "남양주",
      "오산",
      "시흥",
      "군포",
      "의왕",
      "하남",
      "용인",
      "파주",
      "이천",
      "안성",
      "김포",
      "화성",
      "양주",
      "포천",
      "여주",
      "연천",
      "가평",
      "양평",
    ],
    충청권: [
      "대전",
      "서대전",
      "세종",
      "충북",
      "충남",
      "청주",
      "충주",
      "제천",
      "보은",
      "옥천",
      "영동",
      "진천",
      "괴산",
      "음성",
      "단양",
      "증평",
      "천안",
      "공주",
      "보령",
      "아산",
      "서산",
      "논산",
      "계룡",
      "당진",
      "금산",
      "부여",
      "서천",
      "청양",
      "홍성",
      "예산",
      "태안",
    ],
    전라권: [
      "광주",
      "전북",
      "전남",
      "전주",
      "군산",
      "익산",
      "정읍",
      "남원",
      "김제",
      "완주",
      "진안",
      "무주",
      "장수",
      "임실",
      "순창",
      "고창",
      "부안",
      "목포",
      "여수",
      "순천",
      "나주",
      "광양",
      "담양",
      "곡성",
      "구례",
      "고흥",
      "보성",
      "화순",
      "장흥",
      "강진",
      "해남",
      "영암",
      "무안",
      "함평",
      "영광",
      "장성",
      "완도",
      "진도",
      "신안",
    ],
    경상권: [
      "부산",
      "대구",
      "울산",
      "경북",
      "경남",
      "포항",
      "경주",
      "김천",
      "안동",
      "구미",
      "영주",
      "영천",
      "상주",
      "문경",
      "경산",
      "군위",
      "의성",
      "청송",
      "영양",
      "영덕",
      "청도",
      "고령",
      "성주",
      "칠곡",
      "예천",
      "봉화",
      "울진",
      "울릉",
      "창원",
      "진주",
      "통영",
      "사천",
      "김해",
      "밀양",
      "거제",
      "양산",
      "의령",
      "함안",
      "창녕",
      "고성",
      "남해",
      "하동",
      "산청",
      "함양",
      "거창",
      "합천",
    ],
    강원권: [
      "강원",
      "춘천",
      "원주",
      "강릉",
      "동해",
      "태백",
      "속초",
      "삼척",
      "홍천",
      "횡성",
      "영월",
      "평창",
      "정선",
      "철원",
      "화천",
      "양구",
      "인제",
      "고성",
      "양양",
    ],
    제주권: ["제주", "서귀포"],
  }

  // 팀명에서 지역 추출
  private extractRegion(teamName: string): string {
    const cleanName = teamName.trim()

    for (const [region, cities] of Object.entries(this.regionMapping)) {
      for (const city of cities) {
        if (cleanName.startsWith(city)) {
          return region
        }
      }
    }

    return "기타" // 지역을 찾을 수 없는 경우
  }

  // 팀명 정규화 (띄어쓰기 차이 무시)
  private normalizeTeamName(teamName: string): string {
    return teamName.replace(/\s+/g, "").toLowerCase()
  }

  // 대회 결과 추가
  addTournamentResult(result: TournamentResult) {
    this.results.push(result)
    this.updateTeamStats(result)
  }

  // 팀 통계 업데이트
  private updateTeamStats(result: TournamentResult) {
    const normalizedName = this.normalizeTeamName(result.teamName)
    const region = this.extractRegion(result.teamName)

    if (!this.teamStats.has(normalizedName)) {
      this.teamStats.set(normalizedName, {
        teamName: result.teamName,
        division: result.division,
        region: region,
        championships: 0,
        runnerUps: 0,
        thirdPlaces: 0,
        totalScore: 0,
        tournaments: [],
      })
    }

    const stats = this.teamStats.get(normalizedName)!
    stats.tournaments.push(result)

    // 순위에 따른 통계 업데이트
    switch (result.rank) {
      case 1:
        stats.championships++
        break
      case 2:
        stats.runnerUps++
        break
      case 3:
        stats.thirdPlaces++
        break
    }

    // 총점 계산 (우승: 5점, 준우승: 3점, 3위: 1점)
    stats.totalScore = stats.championships * 5 + stats.runnerUps * 3 + stats.thirdPlaces * 1
  }

  getDivisionRankings(division?: string): DivisionTeamStats[] {
    const divisionTeams = new Map<string, DivisionTeamStats>()

    // Process all results to create division-specific team stats
    this.results.forEach((result) => {
      // Only process results for the specified division
      if (division && result.division !== division) {
        return
      }

      const normalizedName = this.normalizeTeamName(result.teamName)
      const teamKey = `${normalizedName}-${result.division}`

      if (!divisionTeams.has(teamKey)) {
        divisionTeams.set(teamKey, {
          teamName: result.teamName,
          division: result.division,
          region: this.extractRegion(result.teamName),
          championships: 0,
          runnerUps: 0,
          thirdPlaces: 0,
          totalScore: 0,
          tournaments: [],
        })
      }

      const teamStats = divisionTeams.get(teamKey)!
      teamStats.tournaments.push(result)

      // Update statistics based on rank
      switch (result.rank) {
        case 1:
          teamStats.championships++
          break
        case 2:
          teamStats.runnerUps++
          break
        case 3:
          teamStats.thirdPlaces++
          break
      }

      // Calculate total score (우승: 5점, 준우승: 3점, 3위: 1점)
      teamStats.totalScore = teamStats.championships * 5 + teamStats.runnerUps * 3 + teamStats.thirdPlaces * 1
    })

    const sortedTeams = Array.from(divisionTeams.values()).sort((a, b) => {
      // 우승 횟수 우선
      if (a.championships !== b.championships) {
        return b.championships - a.championships
      }
      // 준우승 횟수
      if (a.runnerUps !== b.runnerUps) {
        return b.runnerUps - a.runnerUps
      }
      // 3위 횟수
      return b.thirdPlaces - a.thirdPlaces
    })

    return sortedTeams
  }

  getRegionalRankings(region: string, division?: string): DivisionTeamStats[] {
    const divisionRankings = this.getDivisionRankings(division)
    return divisionRankings.filter((team) => team.region === region)
  }

  // 모든 부 목록 가져오기
  getAllDivisions(): string[] {
    const divisions = new Set<string>()
    this.teamStats.forEach((team) => divisions.add(team.division))
    return Array.from(divisions).sort()
  }

  // 모든 권역 목록 가져오기
  getAllRegions(): string[] {
    return Object.keys(this.regionMapping)
  }

  // 팀 상세 정보 가져오기
  getTeamDetails(teamName: string): TeamStats | undefined {
    const normalizedName = this.normalizeTeamName(teamName)
    return this.teamStats.get(normalizedName)
  }

  // 데이터 검증 (누락 팀 확인)
  validateData(): { division: string; teamCount: number }[] {
    const divisionCounts = new Map<string, number>()

    this.teamStats.forEach((team) => {
      const count = divisionCounts.get(team.division) || 0
      divisionCounts.set(team.division, count + 1)
    })

    return Array.from(divisionCounts.entries()).map(([division, teamCount]) => ({
      division,
      teamCount,
    }))
  }

  addTournament(tournamentName: string, tournamentResults: TournamentResult[], tournamentDate?: string) {
    this.tournamentCount++
    this.tournamentNames.push(tournamentName)
    this.tournamentDates.push(tournamentDate || "")
    console.log(
      `[v0] Adding tournament ${this.tournamentCount}: ${tournamentName} with ${tournamentResults.length} results`,
    )

    tournamentResults.forEach((result) => {
      this.addTournamentResult(result)
    })

    console.log(`[v0] Total teams after ${tournamentName}: ${this.teamStats.size}`)
  }

  getTournamentStats() {
    return {
      totalTournaments: this.tournamentCount,
      totalTeams: this.teamStats.size,
      totalResults: this.results.length,
    }
  }

  getAllTournamentNames(): string[] {
    return [...this.tournamentNames]
  }

  getAllTournamentNamesWithDates(): Array<{ name: string; date: string }> {
    return this.tournamentNames.map((name, index) => ({
      name,
      date: this.tournamentDates[index] || "",
    }))
  }

  clearAllData() {
    this.results = []
    this.teamStats.clear()
    this.tournamentCount = 0
    this.tournamentNames = []
    this.tournamentDates = []
    console.log("[v0] All tournament data cleared")
  }

  initializeRealData() {
    // Clear any existing data first
    this.clearAllData()

    // 데이터가 비어있음을 로그로 표시
    console.log("[v0] Tournament data processor initialized with empty data")
    console.log("[v0] Ready to receive tournament data from external sources")
  }
}

export const volleyballData = new VolleyballDataProcessor()
volleyballData.initializeRealData()
