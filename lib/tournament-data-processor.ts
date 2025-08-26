// 전국 배구대회 결과 데이터 처리 시스템
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

    // 제3회 인제 내린천배 한국9인제 배구 챔피언쉽 (2025.3.8-3.9)
    const tournament1Results: TournamentResult[] = [
      // 남자클럽 2부
      { tournament: "제3회 인제 내린천배", division: "남자클럽 2부", teamName: "서울 엄보스", rank: 1 },
      { tournament: "제3회 인제 내린천배", division: "남자클럽 2부", teamName: "용인 토이스토리", rank: 2 },
      { tournament: "제3회 인제 내린천배", division: "남자클럽 2부", teamName: "서울 NWN", rank: 3 },
      { tournament: "제3회 인제 내린천배", division: "남자클럽 2부", teamName: "서울 차차차", rank: 3 },

      // 남자클럽 3부
      { tournament: "제3회 인제 내린천배", division: "남자클럽 3부", teamName: "제천 JSVC", rank: 1 },
      { tournament: "제3회 인제 내린천배", division: "남자클럽 3부", teamName: "서울 샤샤샤", rank: 2 },
      { tournament: "제3회 인제 내린천배", division: "남자클럽 3부", teamName: "용인 오합지존", rank: 3 },
      { tournament: "제3회 인제 내린천배", division: "남자클럽 3부", teamName: "남양주배구사랑", rank: 3 },
      { tournament: "제3회 인제 내린천배", division: "남자클럽 3부", teamName: "서울 DGZ", rank: 1 },
      { tournament: "제3회 인제 내린천배", division: "남자클럽 3부", teamName: "서울 삼각산파워", rank: 2 },
      { tournament: "제3회 인제 내린천배", division: "남자클럽 3부", teamName: "남양주배구사랑", rank: 3 },
      { tournament: "제3회 인제 내린천배", division: "남자클럽 3부", teamName: "인천 라이크발리볼", rank: 3 },

      // 남자 대학부
      { tournament: "제3회 인제 내린천배", division: "남자 대학부", teamName: "국민대 VAT", rank: 1 },
      { tournament: "제3회 인제 내린천배", division: "남자 대학부", teamName: "서울대 남자배구", rank: 2 },
      { tournament: "제3회 인제 내린천배", division: "남자 대학부", teamName: "건국대 아마배구", rank: 3 },
      { tournament: "제3회 인제 내린천배", division: "남자 대학부", teamName: "삼육대 SU-WINGS", rank: 3 },

      // 여자클럽 3부
      { tournament: "제3회 인제 내린천배", division: "여자클럽 3부", teamName: "세종 맥스", rank: 1 },
      { tournament: "제3회 인제 내린천배", division: "여자클럽 3부", teamName: "서울 차차차", rank: 2 },
      { tournament: "제3회 인제 내린천배", division: "여자클럽 3부", teamName: "서울 우리하모니", rank: 3 },
      { tournament: "제3회 인제 내린천배", division: "여자클럽 3부", teamName: "서울 GVT", rank: 3 },

      // 여자 대학부
      { tournament: "제3회 인제 내린천배", division: "여자 대학부", teamName: "연세대 RECEIVE", rank: 1 },
      { tournament: "제3회 인제 내린천배", division: "여자 대학부", teamName: "한국제대 KUV", rank: 2 },
      { tournament: "제3회 인제 내린천배", division: "여자 대학부", teamName: "서울대 여자배구", rank: 3 },
      { tournament: "제3회 인제 내린천배", division: "여자 대학부", teamName: "삼육대 SU-WINGS", rank: 3 },
    ]

    this.addTournament("제3회 인제 내린천배", tournament1Results, "2025.3.8-3.9")

    const tournament2Results: TournamentResult[] = [
      // 남자 시니어부
      { tournament: "제18회 광양백운산기", division: "남자 시니어부", teamName: "목포 SMC", rank: 1 },
      { tournament: "제18회 광양백운산기", division: "남자 시니어부", teamName: "광양 옥곡", rank: 2 },
      { tournament: "제18회 광양백운산기", division: "남자 시니어부", teamName: "해남 우리", rank: 3 },

      // 남자클럽 3부
      { tournament: "제18회 광양백운산기", division: "남자클럽 3부", teamName: "부산 신과함께", rank: 1 },
      { tournament: "제18회 광양백운산기", division: "남자클럽 3부", teamName: "목포 하나", rank: 2 },
      { tournament: "제18회 광양백운산기", division: "남자클럽 3부", teamName: "순천 EST", rank: 3 },
      { tournament: "제18회 광양백운산기", division: "남자클럽 3부", teamName: "진주 행복배구단", rank: 3 },

      // 여자클럽 3부
      { tournament: "제18회 광양백운산기", division: "여자클럽 3부", teamName: "대전 아리", rank: 1 },
      { tournament: "제18회 광양백운산기", division: "여자클럽 3부", teamName: "순천 유앤아이", rank: 2 },
      { tournament: "제18회 광양백운산기", division: "여자클럽 3부", teamName: "부산 CSN", rank: 3 },
    ]

    this.addTournament("제18회 광양백운산기", tournament2Results)

    const tournament3Results: TournamentResult[] = [
      // 남자 시니어부
      { tournament: "제2회 빛고을 무등산배", division: "남자 시니어부", teamName: "광주 빛고을", rank: 1 },
      { tournament: "제2회 빛고을 무등산배", division: "남자 시니어부", teamName: "서울 휴먼스", rank: 2 },
      { tournament: "제2회 빛고을 무등산배", division: "남자 시니어부", teamName: "정읍 배사모", rank: 3 },
      { tournament: "제2회 빛고을 무등산배", division: "남자 시니어부", teamName: "광주 렛츠고", rank: 3 },

      // 남자클럽 3부
      { tournament: "제2회 빛고을 무등산배", division: "남자클럽 3부", teamName: "나주 일출", rank: 1 },
      { tournament: "제2회 빛고을 무등산배", division: "남자클럽 3부", teamName: "거창 가즈아", rank: 2 },
      { tournament: "제2회 빛고을 무등산배", division: "남자클럽 3부", teamName: "전주 V9", rank: 3 },
      { tournament: "제2회 빛고을 무등산배", division: "남자클럽 3부", teamName: "대전 아구탱", rank: 3 },

      // 여자클럽 3부
      { tournament: "제2회 빛고을 무등산배", division: "여자클럽 3부", teamName: "대구 브이라인", rank: 1 },
      { tournament: "제2회 빛고을 무등산배", division: "여자클럽 3부", teamName: "광주 브이퀸", rank: 2 },
      { tournament: "제2회 빛고을 무등산배", division: "여자클럽 3부", teamName: "전주 V9", rank: 3 },
      { tournament: "제2회 빛고을 무등산배", division: "여자클럽 3부", teamName: "광주 히트", rank: 3 },
    ]

    this.addTournament("제2회 빛고을 무등산배", tournament3Results)

    const tournament4Results: TournamentResult[] = [
      // 남자클럽 2부
      { tournament: "2025 청양칠갑산배", division: "남자클럽 2부", teamName: "안산 WE라온", rank: 1 },
      { tournament: "2025 청양칠갑산배", division: "남자클럽 2부", teamName: "광명 선우", rank: 2 },
      { tournament: "2025 청양칠갑산배", division: "남자클럽 2부", teamName: "안산 WE라온", rank: 3 },
      { tournament: "2025 청양칠갑산배", division: "남자클럽 2부", teamName: "수원 Always", rank: 3 },

      // 남자클럽 3부
      { tournament: "2025 청양칠갑산배", division: "남자클럽 3부", teamName: "대전 아리", rank: 1 },
      { tournament: "2025 청양칠갑산배", division: "남자클럽 3부", teamName: "서대전 구봉", rank: 2 },
      { tournament: "2025 청양칠갑산배", division: "남자클럽 3부", teamName: "남양주 별내윙스", rank: 3 },

      // 여자클럽 3부
      { tournament: "2025 청양칠갑산배", division: "여자클럽 3부", teamName: "서울 엑시토", rank: 1 },
      { tournament: "2025 청양칠갑산배", division: "여자클럽 3부", teamName: "서울 GVT", rank: 2 },
      { tournament: "2025 청양칠갑산배", division: "여자클럽 3부", teamName: "전주 토리", rank: 3 },
      { tournament: "2025 청양칠갑산배", division: "여자클럽 3부", teamName: "세종 맥스", rank: 3 },

      // 남자 시니어부
      { tournament: "2025 청양칠갑산배", division: "남자 시니어부", teamName: "서울 한강", rank: 1 },
      { tournament: "2025 청양칠갑산배", division: "남자 시니어부", teamName: "군산배구클럽", rank: 2 },
      { tournament: "2025 청양칠갑산배", division: "남자 시니어부", teamName: "남양주배구사랑", rank: 3 },
      { tournament: "2025 청양칠갑산배", division: "남자 시니어부", teamName: "정읍 지니어스", rank: 3 },

      // 여자 장년부
      { tournament: "2025 청양칠갑산배", division: "여자 장년부", teamName: "남양주 나인걸스", rank: 1 },
      { tournament: "2025 청양칠갑산배", division: "여자 장년부", teamName: "남양주 나인걸스", rank: 2 },
      { tournament: "2025 청양칠갑산배", division: "여자 장년부", teamName: "군산 파란", rank: 3 },
      { tournament: "2025 청양칠갑산배", division: "여자 장년부", teamName: "김제 태종", rank: 3 },
    ]

    this.addTournament("2025 청양칠갑산배", tournament4Results)

    const tournament5Results: TournamentResult[] = [
      // 남자 시니어부
      { tournament: "제23회 나주 배꽃배", division: "남자 시니어부", teamName: "광주 빛고을", rank: 1 },
      { tournament: "제23회 나주 배꽃배", division: "남자 시니어부", teamName: "광주 렛츠고", rank: 2 },
      { tournament: "제23회 나주 배꽃배", division: "남자 시니어부", teamName: "광주 무등산", rank: 3 },
      { tournament: "제23회 나주 배꽃배", division: "남자 시니어부", teamName: "광주 무등산", rank: 3 },

      // 남자클럽 3부
      { tournament: "제23회 나주 배꽃배", division: "남자클럽 3부", teamName: "전주 V9", rank: 1 },
      { tournament: "제23회 나주 배꽃배", division: "남자클럽 3부", teamName: "장흥 회진", rank: 2 },
      { tournament: "제23회 나주 배꽃배", division: "남자클럽 3부", teamName: "목포 하나", rank: 3 },
      { tournament: "제23회 나주 배꽃배", division: "남자클럽 3부", teamName: "영암 삼호리치", rank: 3 },

      // 여자클럽 3부
      { tournament: "제23회 나주 배꽃배", division: "여자클럽 3부", teamName: "광주 곰과여우", rank: 1 },
      { tournament: "제23회 나주 배꽃배", division: "여자클럽 3부", teamName: "목포 클럽", rank: 2 },
      { tournament: "제23회 나주 배꽃배", division: "여자클럽 3부", teamName: "목포 하나", rank: 3 },
      { tournament: "제23회 나주 배꽃배", division: "여자클럽 3부", teamName: "광주 히트", rank: 3 },

      // 남자 장년부
      { tournament: "제23회 나주 배꽃배", division: "남자 장년부", teamName: "광주 드리머스", rank: 1 },
      { tournament: "제23회 나주 배꽃배", division: "남자 장년부", teamName: "광주 GT", rank: 2 },
      { tournament: "제23회 나주 배꽃배", division: "남자 장년부", teamName: "전주 하나로", rank: 3 },
      { tournament: "제23회 나주 배꽃배", division: "남자 장년부", teamName: "장흥 정남진천관", rank: 3 },
    ]

    this.addTournament("제23회 나주 배꽃배", tournament5Results)

    const tournament6Results: TournamentResult[] = [
      // 남자클럽 3부 - 첫 번째 그룹
      { tournament: "제6회 단양소백산배", division: "남자클럽 3부", teamName: "천안 건심회", rank: 1 },
      { tournament: "제6회 단양소백산배", division: "남자클럽 3부", teamName: "영주 소백배구클럽", rank: 2 },
      { tournament: "제6회 단양소백산배", division: "남자클럽 3부", teamName: "청주 공사랑", rank: 3 },
      { tournament: "제6회 단양소백산배", division: "남자클럽 3부", teamName: "수원 ALWAYS", rank: 3 },

      // 남자클럽 3부 - 두 번째 그룹
      { tournament: "제6회 단양소백산배", division: "남자클럽 3부", teamName: "서울 송파창스", rank: 1 },
      { tournament: "제6회 단양소백산배", division: "남자클럽 3부", teamName: "구미 거북클럽", rank: 2 },
      { tournament: "제6회 단양소백산배", division: "남자클럽 3부", teamName: "충주 에이스", rank: 3 },
      { tournament: "제6회 단양소백산배", division: "남자클럽 3부", teamName: "서울 VIPER", rank: 3 },

      // 남자클럽 3부 - 세 번째 그룹
      { tournament: "제6회 단양소백산배", division: "남자클럽 3부", teamName: "서울배구클럽", rank: 1 },
      { tournament: "제6회 단양소백산배", division: "남자클럽 3부", teamName: "의왕 부곡", rank: 2 },
      { tournament: "제6회 단양소백산배", division: "남자클럽 3부", teamName: "천안 에이스", rank: 3 },
      { tournament: "제6회 단양소백산배", division: "남자클럽 3부", teamName: "서울 아스트로하이", rank: 3 },

      // 남자 대학부
      { tournament: "제6회 단양소백산배", division: "남자 대학부", teamName: "국민대 VAT", rank: 1 },
      { tournament: "제6회 단양소백산배", division: "남자 대학부", teamName: "고려대 KU-VOLT", rank: 2 },
      { tournament: "제6회 단양소백산배", division: "남자 대학부", teamName: "서울대 남자배구", rank: 3 },
      { tournament: "제6회 단양소백산배", division: "남자 대학부", teamName: "경희대 어택라인", rank: 3 },

      // 여자클럽 3부 - 첫 번째 그룹
      { tournament: "제6회 단양소백산배", division: "여자클럽 3부", teamName: "거제 라온", rank: 1 },
      { tournament: "제6회 단양소백산배", division: "여자클럽 3부", teamName: "안양 스카이", rank: 2 },
      { tournament: "제6회 단양소백산배", division: "여자클럽 3부", teamName: "서울배구클럽", rank: 3 },
      { tournament: "제6회 단양소백산배", division: "여자클럽 3부", teamName: "수원 ALWAYS", rank: 3 },

      // 여자클럽 3부 - 두 번째 그룹
      { tournament: "제6회 단양소백산배", division: "여자클럽 3부", teamName: "서울 새로", rank: 1 },
      { tournament: "제6회 단양소백산배", division: "여자클럽 3부", teamName: "서울 GVT", rank: 2 },
      { tournament: "제6회 단양소백산배", division: "여자클럽 3부", teamName: "홍성 VOT", rank: 3 },
      { tournament: "제6회 단양소백산배", division: "여자클럽 3부", teamName: "안산 우먼파워", rank: 3 },

      // 여자 대학부
      { tournament: "제6회 단양소백산배", division: "여자 대학부", teamName: "이화여대", rank: 1 },
      { tournament: "제6회 단양소백산배", division: "여자 대학부", teamName: "서울대 여자배구", rank: 2 },
      { tournament: "제6회 단양소백산배", division: "여자 대학부", teamName: "한국제대 KUV", rank: 3 },
      { tournament: "제6회 단양소백산배", division: "여자 대학부", teamName: "상명대 SUV", rank: 3 },
    ]

    this.addTournament("제6회 단양소백산배", tournament6Results)

    const tournament7Results: TournamentResult[] = [
      // 남자 시니어부
      { tournament: "제13회 진해군항제기념", division: "남자 시니어부", teamName: "군산배구클럽", rank: 1 },
      { tournament: "제13회 진해군항제기념", division: "남자 시니어부", teamName: "창원 바람개비", rank: 2 },
      { tournament: "제13회 진해군항제기념", division: "남자 시니어부", teamName: "통영 배우회", rank: 3 },
      { tournament: "제13회 진해군항제기념", division: "남자 시니어부", teamName: "고성 배구동호회", rank: 3 },

      // 남자클럽 3부
      { tournament: "제13회 진해군항제기념", division: "남자클럽 3부", teamName: "부산 준혁이와 아이들", rank: 1 },
      { tournament: "제13회 진해군항제기념", division: "남자클럽 3부", teamName: "창원 동우회", rank: 2 },
      { tournament: "제13회 진해군항제기념", division: "남자클럽 3부", teamName: "순천배구클럽", rank: 3 },
      { tournament: "제13회 진해군항제기념", division: "남자클럽 3부", teamName: "창원 마산 베스트", rank: 3 },

      // 여자클럽 3부
      { tournament: "제13회 진해군항제기념", division: "여자클럽 3부", teamName: "부산 CSN", rank: 1 },
      { tournament: "제13회 진해군항제기념", division: "여자클럽 3부", teamName: "창원 배사랑", rank: 2 },
      { tournament: "제13회 진해군항제기념", division: "여자클럽 3부", teamName: "순천배구클럽", rank: 3 },
      { tournament: "제13회 진해군항제기념", division: "여자클럽 3부", teamName: "김해내외배구클럽", rank: 3 },

      // 남자 장년부
      { tournament: "제13회 진해군항제기념", division: "남자 장년부", teamName: "진주 비봉", rank: 1 },
      { tournament: "제13회 진해군항제기념", division: "남자 장년부", teamName: "울산 레인보우", rank: 2 },
      { tournament: "제13회 진해군항제기념", division: "남자 장년부", teamName: "울산 베스트", rank: 3 },
      { tournament: "제13회 진해군항제기념", division: "남자 장년부", teamName: "창원 동우회", rank: 3 },
    ]

    this.addTournament("제13회 진해군항제기념", tournament7Results)

    const tournament8Results: TournamentResult[] = [
      // 남자클럽 2부
      { tournament: "제4회단양도담삼봉배", division: "남자클럽 2부", teamName: "화성 체인지", rank: 1 },
      { tournament: "제4회단양도담삼봉배", division: "남자클럽 2부", teamName: "서울 98즈", rank: 2 },
      { tournament: "제4회단양도담삼봉배", division: "남자클럽 2부", teamName: "수원 HB", rank: 3 },
      { tournament: "제4회단양도담삼봉배", division: "남자클럽 2부", teamName: "대전 WITH WIN", rank: 3 },

      // 남자클럽 3부 - 첫 번째 그룹
      { tournament: "제4회단양도담삼봉배", division: "남자클럽 3부", teamName: "대전 아리", rank: 1 },
      { tournament: "제4회단양도담삼봉배", division: "남자클럽 3부", teamName: "서울 송파창스", rank: 2 },
      { tournament: "제4회단양도담삼봉배", division: "남자클럽 3부", teamName: "인천 라이크발리볼", rank: 3 },
      { tournament: "제4회단양도담삼봉배", division: "남자클럽 3부", teamName: "서울 VNUE", rank: 3 },

      // 남자클럽 3부 - 두 번째 그룹
      { tournament: "제4회단양도담삼봉배", division: "남자클럽 3부", teamName: "서울 VNUE", rank: 1 },
      { tournament: "제4회단양도담삼봉배", division: "남자클럽 3부", teamName: "서울 TEAM KCK", rank: 2 },
      { tournament: "제4회단양도담삼봉배", division: "남자클럽 3부", teamName: "대구 달서구 배구협회", rank: 3 },
      { tournament: "제4회단양도담삼봉배", division: "남자클럽 3부", teamName: "서울 힘찬 장어", rank: 3 },

      // 남자 대학부
      { tournament: "제4회단양도담삼봉배", division: "남자 대학부", teamName: "국민대 VAT", rank: 1 },
      { tournament: "제4회단양도담삼봉배", division: "남자 대학부", teamName: "서원대", rank: 2 },
      { tournament: "제4회단양도담삼봉배", division: "남자 대학부", teamName: "연세대 RECEIVE", rank: 3 },
      { tournament: "제4회단양도담삼봉배", division: "남자 대학부", teamName: "고려대 KU-VOLT", rank: 3 },

      // 여자클럽 3부
      { tournament: "제4회단양도담삼봉배", division: "여자클럽 3부", teamName: "서울 아스트로하이", rank: 1 },
      { tournament: "제4회단양도담삼봉배", division: "여자클럽 3부", teamName: "구리시", rank: 2 },
      { tournament: "제4회단양도담삼봉배", division: "여자클럽 3부", teamName: "광명 DMG", rank: 3 },
      { tournament: "제4회단양도담삼봉배", division: "여자클럽 3부", teamName: "구리 TVT", rank: 3 },

      // 여자 장년부
      { tournament: "제4회단양도담삼봉배", division: "여자 장년부", teamName: "서울 VTS", rank: 1 },
      { tournament: "제4회단양도담삼봉배", division: "여자 장년부", teamName: "서울 우리하모니", rank: 2 },
      { tournament: "제4회단양도담삼봉배", division: "여자 장년부", teamName: "서울 뉴어울채", rank: 3 },
      { tournament: "제4회단양도담삼봉배", division: "여자 장년부", teamName: "서울 위드드림", rank: 3 },

      // 남자 시니어부
      { tournament: "제4회단양도담삼봉배", division: "남자 시니어부", teamName: "서울 609", rank: 1 },
      { tournament: "제4회단양도담삼봉배", division: "남자 시니어부", teamName: "서울 한강", rank: 2 },
      { tournament: "제4회단양도담삼봉배", division: "남자 시니어부", teamName: "서울 네잎클로버", rank: 3 },
      { tournament: "제4회단양도담삼봉배", division: "남자 시니어부", teamName: "남양주 배구사랑", rank: 3 },
    ]

    this.addTournament("제4회단양도담삼봉배", tournament8Results)

    const tournament9Results: TournamentResult[] = [
      // 남자 시니어부
      { tournament: "제16회 순천만갈대배", division: "남자 시니어부", teamName: "광주 렛츠고", rank: 1 },
      { tournament: "제16회 순천만갈대배", division: "남자 시니어부", teamName: "서천클럽", rank: 2 },
      { tournament: "제16회 순천만갈대배", division: "남자 시니어부", teamName: "광양 시니어", rank: 3 },
      { tournament: "제16회 순천만갈대배", division: "남자 시니어부", teamName: "광주 문정", rank: 3 },

      // 남자클럽 3부 - 첫 번째 그룹
      { tournament: "제16회 순천만갈대배", division: "남자클럽 3부", teamName: "순천배구클럽", rank: 1 },
      { tournament: "제16회 순천만갈대배", division: "남자클럽 3부", teamName: "목포 하나", rank: 2 },
      { tournament: "제16회 순천만갈대배", division: "남자클럽 3부", teamName: "부산 나이스", rank: 3 },
      { tournament: "제16회 순천만갈대배", division: "남자클럽 3부", teamName: "전주 V9", rank: 3 },

      // 남자클럽 3부 - 두 번째 그룹
      { tournament: "제16회 순천만갈대배", division: "남자클럽 3부", teamName: "광주 문정", rank: 1 },
      { tournament: "제16회 순천만갈대배", division: "남자클럽 3부", teamName: "부산 노발대발", rank: 2 },
      { tournament: "제16회 순천만갈대배", division: "남자클럽 3부", teamName: "전주 V9", rank: 3 },
      { tournament: "제16회 순천만갈대배", division: "남자클럽 3부", teamName: "의령 홍의장군", rank: 3 },

      // 여자클럽 3부
      { tournament: "제16회 순천만갈대배", division: "여자클럽 3부", teamName: "광주 썬클럽", rank: 1 },
      { tournament: "제16회 순천만갈대배", division: "여자클럽 3부", teamName: "전주 토리", rank: 2 },
      { tournament: "제16회 순천만갈대배", division: "여자클럽 3부", teamName: "목포 유달", rank: 3 },
      { tournament: "제16회 순천만갈대배", division: "여자클럽 3부", teamName: "전주 V9", rank: 3 },

      // 여자 장년부
      { tournament: "제16회 순천만갈대배", division: "여자 장년부", teamName: "목포 레전드", rank: 1 },
      { tournament: "제16회 순천만갈대배", division: "여자 장년부", teamName: "여수 동백", rank: 2 },
      { tournament: "제16회 순천만갈대배", division: "여자 장년부", teamName: "광주 무등산", rank: 3 },
      { tournament: "제16회 순천만갈대배", division: "여자 장년부", teamName: "광양 플렉스", rank: 3 },
    ]

    this.addTournament("제16회 순천만갈대배", tournament9Results)

    const tournament10Results: TournamentResult[] = [
      // 남자클럽 3부
      { tournament: "제1회 횡성한우배", division: "남자클럽 3부", teamName: "서울 TEAM KCK", rank: 1 },
      { tournament: "제1회 횡성한우배", division: "남자클럽 3부", teamName: "서울 VNUE", rank: 2 },
      { tournament: "제1회 횡성한우배", division: "남자클럽 3부", teamName: "서울 삼각산 파워", rank: 3 },
      { tournament: "제1회 횡성한우배", division: "남자클럽 3부", teamName: "서울 유앤아이", rank: 3 },

      // 여자클럽 3부
      { tournament: "제1회 횡성한우배", division: "여자클럽 3부", teamName: "서울 차차차", rank: 1 },
      { tournament: "제1회 횡성한우배", division: "여자클럽 3부", teamName: "서울 아스트로하이", rank: 2 },
      { tournament: "제1회 횡성한우배", division: "여자클럽 3부", teamName: "서울 오비오", rank: 3 },
      { tournament: "제1회 횡성한우배", division: "여자클럽 3부", teamName: "이천 TEAM YRI", rank: 3 },
    ]

    this.addTournament("제1회 횡성한우배", tournament10Results)

    const tournament11Results: TournamentResult[] = [
      // 여자클럽 3부 - 첫 번째 그룹
      { tournament: "제53회 생활체육 카네이션", division: "여자클럽 3부", teamName: "포항 청암", rank: 1 },
      { tournament: "제53회 생활체육 카네이션", division: "여자클럽 3부", teamName: "부산 나이스", rank: 2 },
      { tournament: "제53회 생활체육 카네이션", division: "여자클럽 3부", teamName: "창원 배사랑", rank: 3 },
      { tournament: "제53회 생활체육 카네이션", division: "여자클럽 3부", teamName: "서울 동대문구 여성배구", rank: 3 },

      // 여자클럽 3부 - 두 번째 그룹
      { tournament: "제53회 생활체육 카네이션", division: "여자클럽 3부", teamName: "대구교대OB", rank: 1 },
      { tournament: "제53회 생활체육 카네이션", division: "여자클럽 3부", teamName: "울산 레인보우", rank: 2 },
      { tournament: "제53회 생활체육 카네이션", division: "여자클럽 3부", teamName: "울산 스타", rank: 3 },
      { tournament: "제53회 생활체육 카네이션", division: "여자클럽 3부", teamName: "울산 빌리퀸", rank: 3 },

      // 여자 장년부
      { tournament: "제53회 생활체육 카네이션", division: "여자 장년부", teamName: "발리원", rank: 1 },
      { tournament: "제53회 생활체육 카네이션", division: "여자 장년부", teamName: "부산 BS 클럽", rank: 2 },
      { tournament: "제53회 생활체육 카네이션", division: "여자 장년부", teamName: "창원 바람개비", rank: 3 },
      { tournament: "제53회 생활체육 카네이션", division: "여자 장년부", teamName: "부산 비전", rank: 3 },

      // 남자 시니어부
      { tournament: "제53회 생활체육 카네이션", division: "남자 시니어부", teamName: "군산배구클럽", rank: 1 },
      { tournament: "제53회 생활체육 카네이션", division: "남자 시니어부", teamName: "창원 바람개비", rank: 2 },
      { tournament: "제53회 생활체육 카네이션", division: "남자 시니어부", teamName: "수원 유에이스", rank: 3 },
      { tournament: "제53회 생활체육 카네이션", division: "남자 시니어부", teamName: "포항 영일만", rank: 3 },

      // 남자 실버부
      { tournament: "제53회 생활체육 카네이션", division: "남자 실버부", teamName: "통영실버", rank: 1 },
      { tournament: "제53회 생활체육 카네이션", division: "남자 실버부", teamName: "수원 유에이스", rank: 2 },
      { tournament: "제53회 생활체육 카네이션", division: "남자 실버부", teamName: "순천 무진", rank: 3 },
      { tournament: "제53회 생활체육 카네이션", division: "남자 실버부", teamName: "순천 실버드림", rank: 3 },
    ]

    this.addTournament("제53회 생활체육 카네이션", tournament11Results)

    const tournament12Results: TournamentResult[] = [
      // 남자클럽 3부
      { tournament: "제61회 박계조배", division: "남자클럽 3부", teamName: "서울 TEAM KCK", rank: 1 },
      { tournament: "제61회 박계조배", division: "남자클럽 3부", teamName: "문경새재배구", rank: 2 },
      { tournament: "제61회 박계조배", division: "남자클럽 3부", teamName: "강릉 GV90", rank: 3 },
      { tournament: "제61회 박계조배", division: "남자클럽 3부", teamName: "청주 저스트플레이", rank: 3 },

      // 여자클럽 3부
      { tournament: "제61회 박계조배", division: "여자클럽 3부", teamName: "수원 HB", rank: 1 },
      { tournament: "제61회 박계조배", division: "여자클럽 3부", teamName: "서울 VNUE", rank: 2 },
      { tournament: "제61회 박계조배", division: "여자클럽 3부", teamName: "서울 알파배구클럽", rank: 3 },
      { tournament: "제61회 박계조배", division: "여자클럽 3부", teamName: "남양주 하누리", rank: 3 },

      // 남자 대학부
      { tournament: "제61회 박계조배", division: "남자 대학부", teamName: "서강대 SPIKEG", rank: 1 },
      { tournament: "제61회 박계조배", division: "남자 대학부", teamName: "삼육대 SU-WINGS", rank: 2 },
      { tournament: "제61회 박계조배", division: "남자 대학부", teamName: "고려대 KU-VOLT", rank: 3 },
      { tournament: "제61회 박계조배", division: "남자 대학부", teamName: "국민대 VAT", rank: 3 },

      // 여자 대학부
      { tournament: "제61회 박계조배", division: "여자 대학부", teamName: "이화여대", rank: 1 },
      { tournament: "제61회 박계조배", division: "여자 대학부", teamName: "숙명여대 최후의 발악", rank: 2 },
      { tournament: "제61회 박계조배", division: "여자 대학부", teamName: "삼육대 SU-WINGS", rank: 3 },
      { tournament: "제61회 박계조배", division: "여자 대학부", teamName: "건국대 아마배구", rank: 3 },

      // 남자 국제부
      { tournament: "제61회 박계조배", division: "남자 국제부", teamName: "러시아", rank: 1 },
      { tournament: "제61회 박계조배", division: "남자 국제부", teamName: "군포 올스타", rank: 2 },
      { tournament: "제61회 박계조배", division: "남자 국제부", teamName: "OP", rank: 3 },
      { tournament: "제61회 박계조배", division: "남자 국제부", teamName: "MANIAIA", rank: 3 },

      // 여자 국제부
      { tournament: "제61회 박계조배", division: "여자 국제부", teamName: "OP", rank: 1 },
      { tournament: "제61회 박계조배", division: "여자 국제부", teamName: "아레스B", rank: 2 },
      { tournament: "제61회 박계조배", division: "여자 국제부", teamName: "배구홀릭", rank: 3 },
      { tournament: "제61회 박계조배", division: "여자 국제부", teamName: "TANOA", rank: 3 },

      // 남자 시니어부
      { tournament: "제61회 박계조배", division: "남자 시니어부", teamName: "서울 TEAM GP", rank: 1 },
      { tournament: "제61회 박계조배", division: "남자 시니어부", teamName: "서울 동명", rank: 2 },
      { tournament: "제61회 박계조배", division: "남자 시니어부", teamName: "서울 위더스", rank: 3 },
      { tournament: "제61회 박계조배", division: "남자 시니어부", teamName: "서울 서초배사모", rank: 3 },
    ]

    this.addTournament("제61회 박계조배", tournament12Results)

    const tournament13Results: TournamentResult[] = [
      // 남자클럽 3부
      { tournament: "제131주년 동학농민혁명기념", division: "남자클럽 3부", teamName: "전주 V9", rank: 1 },
      { tournament: "제131주년 동학농민혁명기념", division: "남자클럽 3부", teamName: "전주 전라클럽", rank: 2 },
      { tournament: "제131주년 동학농민혁명기념", division: "남자클럽 3부", teamName: "전주 V9", rank: 3 },
      { tournament: "제131주년 동학농민혁명기념", division: "남자클럽 3부", teamName: "전주 다이렉트", rank: 3 },

      // 여자클럽 3부
      { tournament: "제131주년 동학농민혁명기념", division: "여자클럽 3부", teamName: "세종 맥스", rank: 1 },
      { tournament: "제131주년 동학농민혁명기념", division: "여자클럽 3부", teamName: "서울 VNUE", rank: 2 },
      { tournament: "제131주년 동학농민혁명기념", division: "여자클럽 3부", teamName: "전주 V9", rank: 3 },
      { tournament: "제131주년 동학농민혁명기념", division: "여자클럽 3부", teamName: "대전 자이언트", rank: 3 },
    ]

    this.addTournament("제131주년 동학농민혁명기념", tournament13Results)

    const tournament14Results: TournamentResult[] = [
      // 남자 시니어부
      { tournament: "제5회 강진청자배", division: "남자 시니어부", teamName: "남해 72지킴이", rank: 1 },
      { tournament: "제5회 강진청자배", division: "남자 시니어부", teamName: "광주 무등산", rank: 2 },
      { tournament: "제5회 강진청자배", division: "남자 시니어부", teamName: "광주 문정", rank: 3 },
      { tournament: "제5회 강진청자배", division: "남자 시니어부", teamName: "광주 빛고을", rank: 3 },

      // 남자 장년부
      { tournament: "제5회 강진청자배", division: "남자 장년부", teamName: "부산 연산", rank: 1 },
      { tournament: "제5회 강진청자배", division: "남자 장년부", teamName: "광주 드리머스", rank: 2 },
      { tournament: "제5회 강진청자배", division: "남자 장년부", teamName: "광주 GT", rank: 3 },
      { tournament: "제5회 강진청자배", division: "남자 장년부", teamName: "광주 배사모", rank: 3 },

      // 남자클럽 3부
      { tournament: "제5회 강진청자배", division: "남자클럽 3부", teamName: "진도 GO", rank: 1 },
      { tournament: "제5회 강진청자배", division: "남자클럽 3부", teamName: "대전 범죄도시", rank: 2 },
      { tournament: "제5회 강진청자배", division: "남자클럽 3부", teamName: "광주 나르샤", rank: 3 },
      { tournament: "제5회 강진청자배", division: "남자클럽 3부", teamName: "무안 청호", rank: 3 },

      // 여자클럽 3부
      { tournament: "제5회 강진청자배", division: "여자클럽 3부", teamName: "광주 곰과여우", rank: 1 },
      { tournament: "제5회 강진청자배", division: "여자클럽 3부", teamName: "목포 유달", rank: 2 },
      { tournament: "제5회 강진청자배", division: "여자클럽 3부", teamName: "무안 청호", rank: 3 },
      { tournament: "제5회 강진청자배", division: "여자클럽 3부", teamName: "광양 플렉스", rank: 3 },

      // 여자 장년부
      { tournament: "제5회 강진청자배", division: "여자 장년부", teamName: "목포 레전드", rank: 1 },
      { tournament: "제5회 강진청자배", division: "여자 장년부", teamName: "무안 생체", rank: 2 },
      { tournament: "제5회 강진청자배", division: "여자 장년부", teamName: "광주 무등산", rank: 3 },
      { tournament: "제5회 강진청자배", division: "여자 장년부", teamName: "광주 빛고을", rank: 3 },
    ]

    this.addTournament("제5회 강진청자배", tournament14Results)

    const tournament15Results: TournamentResult[] = [
      // 남자클럽 2부
      { tournament: "제17회 용인특례시 경기일보", division: "남자클럽 2부", teamName: "용인 PVC", rank: 1 },
      { tournament: "제17회 용인특례시 경기일보", division: "남자클럽 2부", teamName: "순천 순광패밀리", rank: 2 },
      {
        tournament: "제17회 용인특례시 경기일보",
        division: "남자클럽 2부",
        teamName: "서울 서대문구배구협회",
        rank: 3,
      },
      { tournament: "제17회 용인특례시 경기일보", division: "남자클럽 2부", teamName: "서울 SVA", rank: 3 },

      // 남자클럽 3부 - 첫 번째 그룹
      { tournament: "제17회 용인특례시 경기일보", division: "남자클럽 3부", teamName: "서울 샤샤샤", rank: 1 },
      { tournament: "제17회 용인특례시 경기일보", division: "남자클럽 3부", teamName: "천안 또바기", rank: 2 },
      { tournament: "제17회 용인특례시 경기일보", division: "남자클럽 3부", teamName: "서울배구클럽", rank: 3 },
      { tournament: "제17회 용인특례시 경기일보", division: "남자클럽 3부", teamName: "청주 저스트플레이", rank: 3 },

      // 남자클럽 3부 - 두 번째 그룹
      { tournament: "제17회 용인특례시 경기일보", division: "남자클럽 3부", teamName: "거창 중앙", rank: 1 },
      { tournament: "제17회 용인특례시 경기일보", division: "남자클럽 3부", teamName: "서울 TEAM KCK", rank: 2 },
      { tournament: "제17회 용인특례시 경기일보", division: "남자클럽 3부", teamName: "서울배구클럽", rank: 3 },
      { tournament: "제17회 용인특례시 경기일보", division: "남자클럽 3부", teamName: "광명 선우", rank: 3 },

      // 여자클럽 3부 - 첫 번째 그룹
      { tournament: "제17회 용인특례시 경기일보", division: "여자클럽 3부", teamName: "서울 VOL", rank: 1 },
      { tournament: "제17회 용인특례시 경기일보", division: "여자클럽 3부", teamName: "서울 DGZ", rank: 2 },
      { tournament: "제17회 용인특례시 경기일보", division: "여자클럽 3부", teamName: "안양 스카이", rank: 3 },
      { tournament: "제17회 용인특례시 경기일보", division: "여자클럽 3부", teamName: "서울 NWN", rank: 3 },

      // 여자클럽 3부 - 두 번째 그룹
      { tournament: "제17회 용인특례시 경기일보", division: "여자클럽 3부", teamName: "서울 GVT", rank: 1 },
      { tournament: "제17회 용인특례시 경기일보", division: "여자클럽 3부", teamName: "서울 새로", rank: 2 },
      { tournament: "제17회 용인특례시 경기일보", division: "여자클럽 3부", teamName: "서울 아스트로하이", rank: 3 },
      { tournament: "제17회 용인특례시 경기일보", division: "여자클럽 3부", teamName: "안산 발리스타", rank: 3 },

      // 남자 대학부
      { tournament: "제17회 용인특례시 경기일보", division: "남자 대학부", teamName: "국민대 VAT", rank: 1 },
      { tournament: "제17회 용인특례시 경기일보", division: "남자 대학부", teamName: "서울대 남자배구", rank: 2 },
      { tournament: "제17회 용인특례시 경기일보", division: "남자 대학부", teamName: "한국체대 KUV", rank: 3 },
      { tournament: "제17회 용인특례시 경기일보", division: "남자 대학부", teamName: "건국대 아마배구", rank: 3 },

      // 여자 대학부
      { tournament: "제17회 용인특례시 경기일보", division: "여자 대학부", teamName: "단국대 창공", rank: 1 },
      { tournament: "제17회 용인특례시 경기일보", division: "여자 대학부", teamName: "상명대 SUV", rank: 2 },
      { tournament: "제17회 용인특례시 경기일보", division: "여자 대학부", teamName: "삼육대 SU-WINGS", rank: 3 },
      { tournament: "제17회 용인특례시 경기일보", division: "여자 대학부", teamName: "성신여대 하랑", rank: 3 },
    ]

    this.addTournament("제17회 용인특례시 경기일보", tournament15Results)

    const tournament16Results: TournamentResult[] = [
      // 남자클럽 3부
      { tournament: "BIG5 스포츠페스타 in 부산 2025", division: "남자클럽 3부", teamName: "부산 DVC", rank: 1 },
      { tournament: "BIG5 스포츠페스타 in 부산 2025", division: "남자클럽 3부", teamName: "울산 레인보우", rank: 2 },
      { tournament: "BIG5 스포츠페스타 in 부산 2025", division: "남자클럽 3부", teamName: "울산 아쎄로", rank: 3 },
      { tournament: "BIG5 스포츠페스타 in 부산 2025", division: "남자클럽 3부", teamName: "대구교대OB", rank: 3 },

      // 여자클럽 3부
      { tournament: "BIG5 스포츠페스타 in 부산 2025", division: "여자클럽 3부", teamName: "창원 배사랑", rank: 1 },
      { tournament: "BIG5 스포츠페스타 in 부산 2025", division: "여자클럽 3부", teamName: "부산 스카이", rank: 2 },
      { tournament: "BIG5 스포츠페스타 in 부산 2025", division: "여자클럽 3부", teamName: "사천 아자", rank: 3 },
      { tournament: "BIG5 스포츠페스타 in 부산 2025", division: "여자클럽 3부", teamName: "부산 BS", rank: 3 },
    ]

    this.addTournament("BIG5 스포츠페스타 in 부산 2025", tournament16Results)

    const tournament17Results: TournamentResult[] = [
      // 남자 시니어부
      { tournament: "제3회 단양 만천하 스카이배", division: "남자 시니어부", teamName: "청주 OB", rank: 1 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자 시니어부", teamName: "서울 한강", rank: 2 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자 시니어부", teamName: "서울 네잎클로버", rank: 3 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자 시니어부", teamName: "안산 위너스", rank: 3 },

      // 남자 장년부
      { tournament: "제3회 단양 만천하 스카이배", division: "남자 장년부", teamName: "울산 단디", rank: 1 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자 장년부", teamName: "문경 스카이", rank: 2 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자 장년부", teamName: "구미 HVC", rank: 3 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자 장년부", teamName: "서울 나인스", rank: 3 },

      // 남자클럽 3부 - 첫 번째 그룹
      { tournament: "제3회 단양 만천하 스카이배", division: "남자클럽 3부", teamName: "대전 아리", rank: 1 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자클럽 3부", teamName: "인천 라이크발리볼", rank: 2 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자클럽 3부", teamName: "청주 저스트플레이", rank: 3 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자클럽 3부", teamName: "서울 VNUE", rank: 3 },

      // 남자클럽 3부 - 두 번째 그룹
      { tournament: "제3회 단양 만천하 스카이배", division: "남자클럽 3부", teamName: "서울 송파창스", rank: 1 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자클럽 3부", teamName: "서울 중랑구", rank: 2 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자클럽 3부", teamName: "전주 하랑", rank: 3 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자클럽 3부", teamName: "서울 서초배사모", rank: 3 },

      // 남자클럽 3부 - 세 번째 그룹 (추가된 KCK 준우승 결과)
      { tournament: "제3회 단양 만천하 스카이배", division: "남자클럽 3부", teamName: "서울 TEAM KCK", rank: 2 },

      // 남자 대학부
      { tournament: "제3회 단양 만천하 스카이배", division: "남자 대학부", teamName: "국민대 VAT", rank: 1 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자 대학부", teamName: "삼육대 SU-WINGS", rank: 2 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자 대학부", teamName: "서원대", rank: 3 },
      { tournament: "제3회 단양 만천하 스카이배", division: "남자 대학부", teamName: "서원대", rank: 3 },

      // 여자클럽 3부 - 첫 번째 그룹
      { tournament: "제3회 단양 만천하 스카이배", division: "여자클럽 3부", teamName: "서울 차차차", rank: 1 },
      { tournament: "제3회 단양 만천하 스카이배", division: "여자클럽 3부", teamName: "서울 유앤아이", rank: 2 },
      { tournament: "제3회 단양 만천하 스카이배", division: "여자클럽 3부", teamName: "청주 DIG", rank: 3 },
      { tournament: "제3회 단양 만천하 스카이배", division: "여자클럽 3부", teamName: "서울 GVT", rank: 3 },

      // 여자클럽 3부 - 두 번째 그룹
      { tournament: "제3회 단양 만천하 스카이배", division: "여자클럽 3부", teamName: "함안 TOP", rank: 1 },
      { tournament: "제3회 단양 만천하 스카이배", division: "여자클럽 3부", teamName: "서울 새로", rank: 2 },
      { tournament: "제3회 단양 만천하 스카이배", division: "여자클럽 3부", teamName: "서울 앞라대구클럽", rank: 3 },
      { tournament: "제3회 단양 만천하 스카이배", division: "여자클럽 3부", teamName: "하남 유미온", rank: 3 },

      // 여자클럽 3부 - 세 번째 그룹
      { tournament: "제3회 단양 만천하 스카이배", division: "여자클럽 3부", teamName: "대전 아리", rank: 1 },
      { tournament: "제3회 단양 만천하 스카이배", division: "여자클럽 3부", teamName: "서울 우리하모니", rank: 2 },
      { tournament: "제3회 단양 만천하 스카이배", division: "여자클럽 3부", teamName: "서울 VNUE", rank: 3 },
      { tournament: "제3회 단양 만천하 스카이배", division: "여자클럽 3부", teamName: "강릉 율곡클럽", rank: 3 },

      // 여자 대학부
      { tournament: "제3회 단양 만천하 스카이배", division: "여자 대학부", teamName: "성신여대 하랑", rank: 1 },
      { tournament: "제3회 단양 만천하 스카이배", division: "여자 대학부", teamName: "삼육대 SU-WINGS", rank: 2 },
      { tournament: "제3회 단양 만천하 스카이배", division: "여자 대학부", teamName: "숙명여대 최후의 발악", rank: 3 },
      { tournament: "제3회 단양 만천하 스카이배", division: "여자 대학부", teamName: "연세대 RECEIVE", rank: 3 },
    ]

    this.addTournament("제3회 단양 만천하 스카이배", tournament17Results, "2025.6.6.-2025.6.8.")

    const tournament18Results: TournamentResult[] = [
      // Мужской клуб 3부
      { tournament: "제2회보성녹차배", division: "남자클럽 3부", teamName: "진주교대OB", rank: 1 },
      { tournament: "제2회보성녹차배", division: "남자클럽 3부", teamName: "목포 하나", rank: 2 },
      { tournament: "제2회보성녹차배", division: "남자클럽 3부", teamName: "목포 문공", rank: 3 },
      { tournament: "제2회보성녹차배", division: "남자클럽 3부", teamName: "거창 가가가가", rank: 3 },

      // Женский клуб 3부
      { tournament: "제2회보성녹차배", division: "여자클럽 3부", teamName: "진주 HAMO", rank: 1 },
      { tournament: "제2회보성녹차배", division: "여자클럽 3부", teamName: "광주 썬클럽", rank: 2 },
      { tournament: "제2회보성녹차배", division: "여자클럽 3부", teamName: "전주 V9", rank: 3 },
      { tournament: "제2회보성녹차배", division: "여자클럽 3부", teamName: "광주 곰과여우", rank: 3 },
    ]

    this.addTournament("제2회보성녹차배", tournament18Results)

    const tournament19Results: TournamentResult[] = [
      // Мужской клуб 2부
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자클럽 2부",
        teamName: "장흥 경로우대",
        rank: 1,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자클럽 2부",
        teamName: "고창 전북흥덕",
        rank: 2,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자클럽 2부",
        teamName: "울산 히어로",
        rank: 3,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자클럽 2부",
        teamName: "대전 WITH WIN",
        rank: 3,
      },

      // Мужской клуб 3부 - 첫 번째 그룹
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자클럽 3부",
        teamName: "거제 WID",
        rank: 1,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자클럽 3부",
        teamName: "창원 동우회",
        rank: 2,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자클럽 3부",
        teamName: "부산 에이퀵",
        rank: 3,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자클럽 3부",
        teamName: "김해 동부",
        rank: 3,
      },

      // Мужской клуб 3부 - 두 번째 그룹
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자클럽 3부",
        teamName: "울산 레인보우",
        rank: 1,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자클럽 3부",
        teamName: "창원 마산 베스트",
        rank: 2,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자클럽 3부",
        teamName: "대구교대OB",
        rank: 3,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자클럽 3부",
        teamName: "진주 비봉",
        rank: 3,
      },

      // Женский клуб 3부 - 첫 번째 그룹
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "여자클럽 3부",
        teamName: "대구 브이라인",
        rank: 1,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "여자클럽 3부",
        teamName: "세종 맥스",
        rank: 2,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "여자클럽 3부",
        teamName: "창원 배사랑",
        rank: 3,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "여자클럽 3부",
        teamName: "순천 유앤아이",
        rank: 3,
      },

      // Женский клуб 3부 - 두 번째 그룹
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "여자클럽 3부",
        teamName: "세종 맥스",
        rank: 1,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "여자클럽 3부",
        teamName: "창원 진해원",
        rank: 2,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "여자클럽 3부",
        teamName: "창원 진해한결",
        rank: 3,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "여자클럽 3부",
        teamName: "여수 여수시배구협회",
        rank: 3,
      },

      // Мужской 장년부
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자 장년부",
        teamName: "진주 비봉",
        rank: 1,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자 장년부",
        teamName: "부산 배구독존",
        rank: 2,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자 장년부",
        teamName: "광주 배사모",
        rank: 3,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자 장년부",
        teamName: "광주 드리머스",
        rank: 3,
      },

      // Мужской 시니어부
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자 시니어부",
        teamName: "대구 달구벌배구회",
        rank: 1,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자 시니어부",
        teamName: "남해 보물섬팀스타",
        rank: 2,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자 시니어부",
        teamName: "창원 시니어",
        rank: 3,
      },
      {
        tournament: "제19회 한산대첩기 전국남녀생활체육배구대회",
        division: "남자 시니어부",
        teamName: "광주 무등산",
        rank: 3,
      },
    ]

    this.addTournament("제19회 한산대첩기 전국남녀생활체육배구대회", tournament19Results)

    const tournament20Results: TournamentResult[] = [
      // Мужской клуб 3부
      {
        tournament: "2025 고창군수배 전국 남녀배구대회",
        division: "남자클럽 3부",
        teamName: "전주 V9",
        rank: 1,
      },
      {
        tournament: "2025 고창군수배 전국 남녀배구대회",
        division: "남자클럽 3부",
        teamName: "목포 하나",
        rank: 2,
      },
      {
        tournament: "2025 고창군수배 전국 남녀배구대회",
        division: "남자클럽 3부",
        teamName: "전주 V9",
        rank: 3,
      },
      {
        tournament: "2025 고창군수배 전국 남녀배구대회",
        division: "남자클럽 3부",
        teamName: "광주 문정",
        rank: 3,
      },

      // Женский клуб 3부
      {
        tournament: "2025 고창군수배 전국 남녀배구대회",
        division: "여자클럽 3부",
        teamName: "광주 브이퀸",
        rank: 1,
      },
      {
        tournament: "2025 고창군수배 전국 남녀배구대회",
        division: "여자클럽 3부",
        teamName: "목포 레전드",
        rank: 2,
      },
      {
        tournament: "2025 고창군수배 전국 남녀배구대회",
        division: "여자클럽 3부",
        teamName: "대전 자이언트",
        rank: 3,
      },
      {
        tournament: "2025 고창군수배 전국 남녀배구대회",
        division: "여자클럽 3부",
        teamName: "군산 파란",
        rank: 3,
      },

      // Мужской 장년부
      {
        tournament: "2025 고창군수배 전국 남녀배구대회",
        division: "남자 장년부",
        teamName: "광주 드리머스",
        rank: 1,
      },
      {
        tournament: "2025 고창군수배 전국 남녀배구대회",
        division: "남자 장년부",
        teamName: "전주 V9",
        rank: 2,
      },
      {
        tournament: "2025 고창군수배 전국 남녀배구대회",
        division: "남자 장년부",
        teamName: "울산 단디",
        rank: 3,
      },
      {
        tournament: "2025 고창군수배 전국 남녀배구대회",
        division: "남자 장년부",
        teamName: "정읍 정읍시청",
        rank: 3,
      },
    ]

    this.addTournament("2025 고창군수배 전국 남녀배구대회", tournament20Results)

    // Tournament 21: 제9회기장미역다시마배전국남.여배구대회 (2025.6.28.-2025.6.29)
    const tournament21Results: TournamentResult[] = [
      // Мужской клуб 3부
      { tournament: "제9회기장미역다시마배전국남.여배구대회", division: "남자클럽 3부", teamName: "전주 V9", rank: 1 },
      {
        tournament: "제9회기장미역다시마배전국남.여배구대회",
        division: "남자클럽 3부",
        teamName: "대전 아리",
        rank: 2,
      },
      { tournament: "제9회기장미역다시마배전국남.여배구대회", division: "남자클럽 3부", teamName: "대구 NTC", rank: 3 },
      {
        tournament: "제9회기장미역다시마배전국남.여배구대회",
        division: "남자클럽 3부",
        teamName: "울산 아쎄로",
        rank: 3,
      },

      // Женский клуб 3부
      {
        tournament: "제9회기장미역다시마배전국남.여배구대회",
        division: "여자클럽 3부",
        teamName: "대전 아리",
        rank: 1,
      },
      { tournament: "제9회기장미역다시마배전국남.여배구대회", division: "여자클럽 3부", teamName: "진주 WIN", rank: 2 },
      {
        tournament: "제9회기장미역다시마배전국남.여배구대회",
        division: "여자클럽 3부",
        teamName: "부산 나이스",
        rank: 3,
      },
      {
        tournament: "제9회기장미역다시마배전국남.여배구대회",
        division: "여자클럽 3부",
        teamName: "대구교대OB",
        rank: 3,
      },
    ]

    this.addTournament("제9회기장미역다시마배전국남.여배구대회", tournament21Results)

    // Tournament 22: 제3회 청풍명월 의림지배 전국 생활체육 배구대회 (2025.6.28.-2025.6.29)
    const tournament22Results: TournamentResult[] = [
      // Мужской клуб 3부 (첫 번째 그룹)
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "천안 하얀마음배구",
        rank: 1,
      },
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "인천 라이크발리볼",
        rank: 2,
      },
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "서울 중랑구",
        rank: 3,
      },
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "서울 CDS",
        rank: 3,
      },

      // Мужской клуб 3부 (두 번째 그룹)
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "서울 VNUE",
        rank: 1,
      },
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "서울 송파창스",
        rank: 2,
      },
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "청주 청풍",
        rank: 3,
      },
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "남자클луб 3부",
        teamName: "청주 저스트플레이",
        rank: 3,
      },

      // Женский клуб 3부
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "여자클럽 3부",
        teamName: "서울 엑시토",
        rank: 1,
      },
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "여자클럽 3부",
        teamName: "서울 GVT",
        rank: 2,
      },
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "여자클럽 3부",
        teamName: "인천 라이크발리볼",
        rank: 3,
      },
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "여자클럽 3부",
        teamName: "광명 선우",
        rank: 3,
      },

      // Мужской 장년부
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "남자 장년부",
        teamName: "세종 배사모",
        rank: 1,
      },
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "남자 장년부",
        teamName: "화성 위너",
        rank: 2,
      },
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "남자 장년부",
        teamName: "광명 선우",
        rank: 3,
      },
      {
        tournament: "제3회 청풍명월 의림지배 전국 생활체육 배구대회",
        division: "남자 장년부",
        teamName: "서울 빅터스",
        rank: 3,
      },
    ]

    this.addTournament("제3회 청풍명월 의림지배 전국 생활체육 배구대회", tournament22Results)

    // Tournament 23: 제36회 해림배 배구대회
    const tournament23Results: TournamentResult[] = [
      // Мужской клуб 3부
      { tournament: "제36회 해림배 배구대회", division: "남자클럽 3부", teamName: "목포 하나", rank: 1 },
      { tournament: "제36회 해림배 배구대회", division: "남자클럽 3부", teamName: "목포 열공", rank: 2 },
      { tournament: "제36회 해림배 배구대회", division: "남자클럽 3부", teamName: "목포 낭만", rank: 3 },
      { tournament: "제36회 해림배 배구대회", division: "남자클럽 3부", teamName: "나주 일출", rank: 3 },

      // Женский клуб 3부
      { tournament: "제36회 해림배 배구대회", division: "여자클럽 3부", teamName: "광주 썬클럽", rank: 1 },
      { tournament: "제36회 해림배 배구대회", division: "여자클럽 3부", teamName: "전주 토리", rank: 2 },
      { tournament: "제36회 해림배 배구대회", division: "여자클럽 3부", teamName: "여수 시니어", rank: 3 },
      { tournament: "제36회 해림배 배구대회", division: "여자클럽 3부", teamName: "광주 GV-23", rank: 3 },

      // Мужской 시니어부
      { tournament: "제36회 해림배 배구대회", division: "남자 시니어부", teamName: "광주 KST", rank: 1 },
      { tournament: "제36회 해림배 배구대회", division: "남자 시니어부", teamName: "광주 SMC", rank: 2 },
      { tournament: "제36회 해림배 배구대회", division: "남자 시니어부", teamName: "광주 렛츠고", rank: 3 },
      { tournament: "제36회 해림배 배구대회", division: "남자 시니어부", teamName: "광주 빛고을", rank: 3 },
    ]

    this.addTournament("제36회 해림배 배구대회", tournament23Results)

    // Tournament 24: 2025년 안산 상록수 9인제 남·여 배구대회
    const tournament24Results: TournamentResult[] = [
      // Мужской клуб 3부
      {
        tournament: "2025년 안산 상록수 9인제 남·여 배구대회",
        division: "남자클럽 3부",
        teamName: "서울 TEAM KCK",
        rank: 1,
      },
      {
        tournament: "2025년 안산 상록수 9인제 남·여 배구대회",
        division: "남자클럽 3부",
        teamName: "인천 배구왕",
        rank: 2,
      },
      {
        tournament: "2025년 안산 상록수 9인제 남·여 배구대회",
        division: "남자클럽 3부",
        teamName: "용인 오합지존",
        rank: 3,
      },
      {
        tournament: "2025년 안산 상록수 9인제 남·여 배구대회",
        division: "남자클럽 3부",
        teamName: "안양 조종현쌤제자들",
        rank: 3,
      },

      // Женский клуб 3부
      {
        tournament: "2025년 안산 상록수 9인제 남·여 배구대회",
        division: "여자클럽 3부",
        teamName: "안양 스카이",
        rank: 1,
      },
      {
        tournament: "2025년 안산 상록수 9인제 남·여 배구대회",
        division: "여자클럽 3부",
        teamName: "광명 마노아",
        rank: 2,
      },
      {
        tournament: "2025년 안산 상록수 9인제 남·여 배구대회",
        division: "여자클럽 3부",
        teamName: "안산 하이볼",
        rank: 3,
      },
      {
        tournament: "2025년 안산 상록수 9인제 남·여 배구대회",
        division: "여자클럽 3부",
        teamName: "안산 에너자이저",
        rank: 3,
      },

      // Женский 장년부
      {
        tournament: "2025년 안산 상록수 9인제 남·여 배구대회",
        division: "여자 장년부",
        teamName: "서울 우리하모니",
        rank: 1,
      },
      { tournament: "2025년 안산 상록수 9인제 남·여 배구대회", division: "여자 장년부", teamName: "서울 VTS", rank: 2 },
      {
        tournament: "2025년 안산 상록수 9인제 남·여 배구대회",
        division: "여자 장년부",
        teamName: "성남 SSVC",
        rank: 3,
      },
      {
        tournament: "2025년 안산 상록수 9인제 남·여 배구대회",
        division: "여자 장년부",
        teamName: "안양배구클럽",
        rank: 3,
      },
    ]

    this.addTournament("2025년 안산 상록수 9인제 남·여 배구대회", tournament24Results)

    // Tournament 25: 제7회 남원춘향배 전국남녀 배구대회
    const tournament25Results: TournamentResult[] = [
      // Мужской 시니어부
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자 시니어부",
        teamName: "광주 무등산",
        rank: 1,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자 시니어부",
        teamName: "정읍 샘골",
        rank: 2,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자 시니어부",
        teamName: "전주 송천클럽",
        rank: 3,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자 시니어부",
        teamName: "남원 춘향애인",
        rank: 3,
      },

      // Мужской 장년부
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자 장년부",
        teamName: "광주 GT",
        rank: 1,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자 장년부",
        teamName: "진주 비봉",
        rank: 2,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자 장년부",
        teamName: "논산 리베로",
        rank: 3,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자 장년부",
        teamName: "임실군청",
        rank: 3,
      },

      // Мужской клуб 3부
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자클럽 3부",
        teamName: "전주 V9",
        rank: 1,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자클럽 3부",
        teamName: "진주 행복배구단",
        rank: 2,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자클럽 3부",
        teamName: "전주 하랑",
        rank: 3,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자클럽 3부",
        teamName: "영암 삼호리치",
        rank: 3,
      },

      // Женский клуб 3부
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "여자클럽 3부",
        teamName: "전주 V9",
        rank: 1,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "여자클럽 3부",
        teamName: "광주 브이퀸",
        rank: 2,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "여자클럽 3부",
        teamName: "전주 전동",
        rank: 3,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "여자클럽 3부",
        teamName: "남해 배구동우회",
        rank: 3,
      },

      // Мужской клуб 2부
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자클럽 2부",
        teamName: "전주 전라클럽",
        rank: 1,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자클럽 2부",
        teamName: "광주 신세대캐터링",
        rank: 2,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자클럽 2부",
        teamName: "여수 팔도프라더",
        rank: 3,
      },
      {
        tournament: "제7회 남원춘향배 전국남녀 배구대회",
        division: "남자클럽 2부",
        teamName: "광주 LBT",
        rank: 3,
      },
    ]

    this.addTournament("제7회 남원춘향배 전국남녀 배구대회", tournament25Results)

    // 제2회 영양 별천지배 스포츠클럽 배구대회 (2025.7.5-7.6)
    const tournament26Results: TournamentResult[] = [
      // Мужской 시니어부
      { tournament: "제2회 영양 별천지배", division: "남자 시니어부", teamName: "남양주 배구사랑", rank: 1 },
      { tournament: "제2회 영양 별천지배", division: "남자 시니어부", teamName: "수원 유에이스", rank: 2 },
      { tournament: "제2회 영양 별천지배", division: "남자 시니어부", teamName: "구미 HVC", rank: 3 },
      { tournament: "제2회 영양 별천지배", division: "남자 시니어부", teamName: "서울 한강", rank: 3 },

      // Женский 장년부
      { tournament: "제2회 영양 별천지배", division: "여자 장년부", teamName: "부산 비전", rank: 1 },
      { tournament: "제2회 영양 별천지배", division: "여자 장년부", teamName: "남양주 나인걸스", rank: 2 },
      { tournament: "제2회 영양 별천지배", division: "여자 장년부", teamName: "구미 하비홀릭", rank: 3 },
      { tournament: "제2회 영양 별천지배", division: "여자 장년부", teamName: "남양주 나인폭스", rank: 3 },

      // Мужской клуб 3부
      { tournament: "제2회 영양 별천지배", division: "남자클럽 3부", teamName: "청주 저스트플레이", rank: 1 },
      { tournament: "제2회 영양 별천지배", division: "남자클럽 3부", teamName: "대전 디그팡팡", rank: 2 },
      { tournament: "제2회 영양 별천지배", division: "남자클럽 3부", teamName: "남양주배구사랑", rank: 3 },
      { tournament: "제2회 영양 별천지배", division: "남자클럽 3부", teamName: "부산배구클럽", rank: 3 },

      // Женский клуб 3부
      { tournament: "제2회 영양 별천지배", division: "여자클럽 3부", teamName: "대구 브이라인", rank: 1 },
      { tournament: "제2회 영양 별천지배", division: "여자클럽 3부", teamName: "대전SVA", rank: 2 },
      { tournament: "제2회 영양 별천지배", division: "여자클럽 3부", teamName: "일산 라라클럽", rank: 3 },
      { tournament: "제2회 영양 별천지배", division: "여자클럽 3부", teamName: "대전 디그팡팡", rank: 3 },
    ]

    this.addTournament("제2회 영양 별천지배 스포츠클럽 배구대회", tournament26Results)

    // 제19회 문화체육관광부장관기 전국생활체육배구대회 (2025.7.12-7.13)
    const tournament27Results: TournamentResult[] = [
      // Мужской клуб 3부 (첫 번째 그룹)
      { tournament: "제19회 문화체육관광부장관기", division: "남자클럽 3부", teamName: "대구교대OB", rank: 1 },
      { tournament: "제19회 문화체육관광부장관기", division: "남자클럽 3부", teamName: "구미 거북클럽", rank: 2 },
      { tournament: "제19회 문화체육관광부장관기", division: "남자클럽 3부", teamName: "구미 HVC", rank: 3 },
      {
        tournament: "제19회 문화체육관광부장관기",
        division: "남자클럽 3부",
        teamName: "대구 달서구 배구협회",
        rank: 3,
      },

      // Мужской клуб 3부 (두 번째 그룹)
      { tournament: "제19회 문화체육관광부장관기", division: "남자클럽 3부", teamName: "부산 연산", rank: 1 },
      { tournament: "제19회 문화체육관광부장관기", division: "남자클럽 3부", teamName: "청주 저스트플레이", rank: 2 },
      { tournament: "제19회 문화체육관광부장관기", division: "남자클럽 3부", teamName: "서울 DGZ", rank: 3 },
      { tournament: "제19회 문화체육관광부장관기", division: "남자클럽 3부", teamName: "울산 레인보우", rank: 3 },

      // Мужской 장년부
      { tournament: "제19회 문화체육관광부장관기", division: "남자 장년부", teamName: "울산 레인보우", rank: 1 },
      { tournament: "제19회 문화체육관광부장관기", division: "남자 장년부", teamName: "서울배구클럽", rank: 2 },
      { tournament: "제19회 문화체육관광부장관기", division: "남자 장년부", teamName: "대전 마벤져스", rank: 3 },
      { tournament: "제19회 문화체육관광부장관기", division: "남자 장년부", teamName: "부산 연산", rank: 3 },

      // Женский клуб 3부 (첫 번째 그룹)
      { tournament: "제19회 문화체육관광부장관기", division: "여자클럽 3부", teamName: "대구교대OB", rank: 1 },
      { tournament: "제19회 문화체육관광부장관기", division: "여자클럽 3부", teamName: "서울 네오클럽", rank: 2 },
      { tournament: "제19회 문화체육관광부장관기", division: "여자클럽 3부", teamName: "울진 마더 WIN", rank: 3 },
      { tournament: "제19회 문화체육관광부장관기", division: "여자클럽 3부", teamName: "서울 차차차", rank: 3 },

      // Женский клуб 3부 (두 번째 그룹)
      { tournament: "제19회 문화체육관광부장관기", division: "여자클럽 3부", teamName: "청주 게스트하우스", rank: 1 },
      { tournament: "제19회 문화체육관광부장관기", division: "여자클럽 3부", teamName: "서울 DGZ", rank: 2 },
      { tournament: "제19회 문화체육관광부장관기", division: "여자클럽 3부", teamName: "서울배구클럽", rank: 3 },
      { tournament: "제19회 문화체육관광부장관기", division: "여자클럽 3부", teamName: "구미 하비홀릭", rank: 3 },

      // Женский 장년부
      { tournament: "제19회 문화체육관광부장관기", division: "여자 장년부", teamName: "서울 목동에이스", rank: 1 },
      { tournament: "제19회 문화체육관광부장관기", division: "여자 장년부", teamName: "부산 나이스", rank: 2 },
      { tournament: "제19회 문화체육관광부장관기", division: "여자 장년부", teamName: "성남시", rank: 3 },
      { tournament: "제19회 문화체육관광부장관기", division: "여자 장년부", teamName: "구미 HVC", rank: 3 },

      // Мужской 국제부
      { tournament: "제19회 문화체육관광부장관기", division: "남자 국제부", teamName: "김밥지옥", rank: 1 },
      { tournament: "제19회 문화체육관광부장관기", division: "남자 국제부", teamName: "베트남", rank: 2 },
      { tournament: "제19회 문화체육관광부장관기", division: "남자 국제부", teamName: "OP", rank: 3 },
      { tournament: "제19회 문화체육관광부장관기", division: "남자 국제부", teamName: "군포 올스타", rank: 3 },
    ]

    this.addTournament("제19회 문화체육관광부장관기 전국생활체육배구대회", tournament27Results)

    // 제18회고흥우주항공배생활체육동호인배구대회 (2025.7.12-7.13)
    const tournament28Results: TournamentResult[] = [
      // Мужской клуб 3부
      { tournament: "제18회고흥우주항공배", division: "남자클럽 3부", teamName: "목포 하나", rank: 1 },
      { tournament: "제18회고흥우주항공배", division: "남자클럽 3부", teamName: "장흥 회진", rank: 2 },
      { tournament: "제18회고흥우주항공배", division: "남자클럽 3부", teamName: "부산 신과함께", rank: 3 },
      { tournament: "제18회고흥우주항공배", division: "남자클럽 3부", teamName: "광주 썬라이즈", rank: 3 },

      // Женский клуб 3부
      { tournament: "제18회고흥우주항공배", division: "여자클럽 3부", teamName: "순천 유앤아이", rank: 1 },
      { tournament: "제18회고흥우주항공배", division: "여자클럽 3부", teamName: "목포 레전드", rank: 2 },
      { tournament: "제18회고흥우주항공배", division: "여자클럽 3부", teamName: "목포 하나", rank: 3 },
      { tournament: "제18회고흥우주항공배", division: "여자클럽 3부", teamName: "목포 클럽", rank: 3 },
    ]

    this.addTournament("제18회고흥우주항공배생활체육동호인배구대회", tournament28Results)

    console.log("[v0] About to add tournament 29: 제12회 순창장류배전국남여배구대회")

    // 제12회 순창장류배전국남여배구대회 (2025.7.19-7.20)
    const tournament29Results: TournamentResult[] = [
      // 남자 장년부
      { tournament: "제12회 순창장류배", division: "남자 장년부", teamName: "광주 드리머스", rank: 1 },
      { tournament: "제12회 순창장류배", division: "남자 장년부", teamName: "순천 EST", rank: 2 },
      { tournament: "제12회 순창장류배", division: "남자 장년부", teamName: "전주 하나로", rank: 3 },
      { tournament: "제12회 순창장류배", division: "남자 장년부", teamName: "전주 V9", rank: 3 },

      // 남자클럽 3부
      { tournament: "제12회 순창장류배", division: "남자클럽 3부", teamName: "전주 V9", rank: 1 },
      { tournament: "제12회 순창장류배", division: "남자클럽 3부", teamName: "광주 문정", rank: 2 },
      { tournament: "제12회 순창장류배", division: "남자클럽 3부", teamName: "전주 V9", rank: 3 },
      { tournament: "제12회 순창장류배", division: "남자클럽 3부", teamName: "영암 하나", rank: 3 },

      // 여자클럽 3부
      { tournament: "제12회 순창장류배", division: "여자클럽 3부", teamName: "광주 썬클럽", rank: 1 },
      { tournament: "제12회 순창장류배", division: "여자클럽 3부", teamName: "순천 배구", rank: 2 },
      { tournament: "제12회 순창장류배", division: "여자클럽 3부", teamName: "전주 V9", rank: 3 },
      { tournament: "제12회 순창장류배", division: "여자클럽 3부", teamName: "광주 곰과여우", rank: 3 },
    ]

    console.log("[v0] Tournament 29 results array length:", tournament29Results.length)
    this.addTournament("제12회 순창장류배전국남여배구대회", tournament29Results)
    console.log("[v0] Tournament 29 added successfully")

    const tournament30Results: TournamentResult[] = [
      // 남자 시니어부
      {
        tournament: "제7회 선비배 전국 남녀 배구대회",
        division: "남자 시니어부",
        teamName: "광주 돌풍시니어",
        rank: 1,
      },
      {
        tournament: "제7회 선비배 전국 남녀 배구대회",
        division: "남자 시니어부",
        teamName: "양산 서창모멘토",
        rank: 2,
      },
      { tournament: "제7회 선비배 전국 남녀 배구대회", division: "남자 시니어부", teamName: "서울 TEAM GP", rank: 3 },

      // 남자 장년부
      { tournament: "제7회 선비배 전국 남녀 배구대회", division: "남자 장년부", teamName: "울산 단디", rank: 1 },
      { tournament: "제7회 선비배 전국 남녀 배구대회", division: "남자 장년부", teamName: "문경 스카이", rank: 2 },
      { tournament: "제7회 선비배 전국 남녀 배구대회", division: "남자 장년부", teamName: "구미 HVC", rank: 3 },
      { tournament: "제7회 선비배 전국 남녀 배구대회", division: "남자 장년부", teamName: "서울 나인스", rank: 3 },

      // 남자클럽 3부
      { tournament: "제7회 선비배 전국 남녀 배구대회", division: "남자클럽 3부", teamName: "진주교대OB", rank: 1 },
      { tournament: "제7회 선비배 전국 남녀 배구대회", division: "남자클럽 3부", teamName: "대구교대OB", rank: 2 },
      { tournament: "제7회 선비배 전국 남녀 배구대회", division: "남자클럽 3부", teamName: "세종 맥스", rank: 3 },
      { tournament: "제7회 선비배 전국 남녀 배구대회", division: "남자클럽 3부", teamName: "문경새재배구", rank: 3 },

      // 여자클럽 3부
      { tournament: "제7회 선비배 전국 남녀 배구대회", division: "여자클럽 3부", teamName: "대구 브이라인", rank: 1 },
      { tournament: "제7회 선비배 전국 남녀 배구대회", division: "여자클럽 3부", teamName: "진주교대OB", rank: 2 },
    ]

    this.addTournament("제7회 선비배 전국 남녀 배구대회", tournament30Results)
    console.log("[v0] Tournament 30 added successfully")

    const tournament31Results: TournamentResult[] = [
      // 남자클럽 3부 - First bracket
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "서울 TEAM KCK",
        rank: 1,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "인천 라이크발리볼",
        rank: 2,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "청주 저스트플레이",
        rank: 3,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "서울 VNUE",
        rank: 3,
      },

      // 남자클럽 3부 - Second bracket
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "서울 TEAM KCK",
        rank: 1,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "서울 TEAM KMP",
        rank: 2,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "서울 중랑구",
        rank: 3,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "남자클럽 3부",
        teamName: "서울 서초배사모",
        rank: 3,
      },

      // 여자클럽 3부 - First bracket
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "여자클럽 3부",
        teamName: "서울 차차차",
        rank: 1,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "여자클럽 3부",
        teamName: "서울 유앤아이",
        rank: 2,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "여자클럽 3부",
        teamName: "청주 DIG",
        rank: 3,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "여자클럽 3부",
        teamName: "서울 GVT",
        rank: 3,
      },

      // 여자클럽 3부 - Second bracket
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "여자클럽 3부",
        teamName: "서울 아스트로하이",
        rank: 1,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "여자클럽 3부",
        teamName: "서울 새로",
        rank: 2,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "여자클럽 3부",
        teamName: "서울 알파배구클럽",
        rank: 3,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "여자클럽 3부",
        teamName: "하남 유니온",
        rank: 3,
      },

      // 남자 장년부
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "남자 장년부",
        teamName: "서울 중랑구",
        rank: 1,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "남자 장년부",
        teamName: "이천 발리더스",
        rank: 2,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "남자 장년부",
        teamName: "광주 KST",
        rank: 3,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "남자 장년부",
        teamName: "서울 나인스",
        rank: 3,
      },

      // 여자 장년부
      { tournament: "제17회 홍천무궁화배 전국생활체육 배구대회", division: "여자 장년부", teamName: "과천시", rank: 1 },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "여자 장년부",
        teamName: "강릉 율곡클럽",
        rank: 2,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "여자 장년부",
        teamName: "남양주 나인걸스",
        rank: 3,
      },
      {
        tournament: "제17회 홍천무궁화배 전국생활체육 배구대회",
        division: "여자 장년부",
        teamName: "안양 U&PANG",
        rank: 3,
      },
    ]

    this.addTournament("제17회 홍천무궁화배 전국생활체육 배구대회", tournament31Results)
    console.log("[v0] Tournament 31 added successfully - All 31 tournaments now complete!")

    const tournament32Results: TournamentResult[] = [
      // 남자클럽 2부
      {
        teamName: "전주 전라클럽",
        division: "남자클럽 2부",
        rank: 1,
        tournament: "제14회 진안홍삼배 전국남여배구대회",
      },
      { teamName: "광주 LBT", division: "남자클럽 2부", rank: 2, tournament: "제14회 진안홍삼배 전국남여배구대회" },
      { teamName: "서울 98즈", division: "남자클럽 2부", rank: 3, tournament: "제14회 진안홍삼배 전국남여배구대회" },
      {
        teamName: "고흥군 배구협회",
        division: "남자클럽 2부",
        rank: 3,
        tournament: "제14회 진안홍삼배 전국남여배구대회",
      },

      // 남자클럽 3부 - 첫 번째 그룹
      { teamName: "서대전 구봉", division: "남자클럽 3부", rank: 1, tournament: "제14회 진안홍삼배 전국남여배구대회" },
      { teamName: "세종 배사모", division: "남자클럽 3부", rank: 2, tournament: "제14회 진안홍삼배 전국남여배구대회" },
      { teamName: "청양 칠갑산", division: "남자클럽 3부", rank: 3, tournament: "제14회 진안홍삼배 전국남여배구대회" },
      {
        teamName: "전주 전라클럽",
        division: "남자클럽 3부",
        rank: 3,
        tournament: "제14회 진안홍삼배 전국남여배구대회",
      },

      // 남자클럽 3부 - 두 번째 그룹
      { teamName: "대전 아리", division: "남자클럽 3부", rank: 1, tournament: "제14회 진안홍삼배 전국남여배구대회" },
      { teamName: "거창 중앙", division: "남자클럽 3부", rank: 2, tournament: "제14회 진안홍삼배 전국남여배구대회" },
      { teamName: "천안 건심회", division: "남자클럽 3부", rank: 3, tournament: "제14회 진안홍삼배 전국남여배구대회" },
      { teamName: "장흥 장강보", division: "남자클럽 3부", rank: 3, tournament: "제14회 진안홍삼배 전국남여배구대회" },

      // 여자클럽 3부 - 첫 번째 그룹
      {
        teamName: "광주 곰과여우",
        division: "여자클럽 3부",
        rank: 1,
        tournament: "제14회 진안홍삼배 전국남여배구대회",
      },
      { teamName: "전주 V9", division: "여자클럽 3부", rank: 2, tournament: "제14회 진안홍삼배 전국남여배구대회" },
      { teamName: "세종 맥스", division: "여자클럽 3부", rank: 3, tournament: "제14회 진안홍삼배 전국남여배구대회" },
      { teamName: "서대전 구봉", division: "여자클럽 3부", rank: 3, tournament: "제14회 진안홍삼배 전국남여배구대회" },

      // 여자클럽 3부 - 두 번째 그룹
      { teamName: "광주 썬클럽", division: "여자클럽 3부", rank: 1, tournament: "제14회 진안홍삼배 전국남여배구대회" },
      {
        teamName: "여수시 배구협회",
        division: "여자클럽 3부",
        rank: 2,
        tournament: "제14회 진안홍삼배 전국남여배구대회",
      },
      {
        teamName: "대전 브이로드",
        division: "여자클럽 3부",
        rank: 3,
        tournament: "제14회 진안홍삼배 전국남여배구대회",
      },
      { teamName: "군산 서로엘", division: "여자클럽 3부", rank: 3, tournament: "제14회 진안홍삼배 전국남여배구대회" },
    ]

    this.addTournament("제14회 진안홍삼배 전국남여배구대회", tournament32Results, "2025.8.16.-2025.8.17.")

    const tournament33Results: TournamentResult[] = [
      // 남자클럽 3부
      { teamName: "부산 신과함께", division: "남자클럽 3부", rank: 1, tournament: "제8회 울진금강송배 전국배구대회" },
      { teamName: "부산 신과함께", division: "남자클럽 3부", rank: 2, tournament: "제8회 울진금강송배 전국배구대회" },
      { teamName: "문경새재배구", division: "남자클럽 3부", rank: 3, tournament: "제8회 울진금강송배 전국배구대회" },
      { teamName: "부산 배구독존", division: "남자클럽 3부", rank: 3, tournament: "제8회 울진금강송배 전국배구대회" },

      // 여자클럽 3부
      { teamName: "서울 SJVC", division: "여자클럽 3부", rank: 1, tournament: "제8회 울진금강송배 전국배구대회" },
      { teamName: "세종 맥스", division: "여자클럽 3부", rank: 2, tournament: "제8회 울진금강송배 전국배구대회" },
      { teamName: "부산 VTC", division: "여자클럽 3부", rank: 3, tournament: "제8회 울진금강송배 전국배구대회" },
      { teamName: "대구 브이라인", division: "여자클럽 3부", rank: 3, tournament: "제8회 울진금강송배 전국배구대회" },

      // 남자 장년부
      { teamName: "수원 ALWAYS", division: "남자 장년부", rank: 1, tournament: "제8회 울진금강송배 전국배구대회" },
      { teamName: "대구 시니어", division: "남자 장년부", rank: 2, tournament: "제8회 울진금강송배 전국배구대회" },
      { teamName: "청주 청백회", division: "남자 장년부", rank: 3, tournament: "제8회 울진금강송배 전국배구대회" },
      { teamName: "남양주 진건", division: "남자 장년부", rank: 3, tournament: "제8회 울진금강송배 전국배구대회" },
    ]

    this.addTournament("제8회 울진금강송배 전국배구대회", tournament33Results, "2025.8.23.-2025.8.24.")

    const tournament34Results: TournamentResult[] = [
      // 남자클럽 3부
      {
        teamName: "장흥 회진",
        division: "남자클럽 3부",
        rank: 1,
        tournament: "제12회 영암 월출산배 전국 남.녀 배구대회",
      },
      {
        teamName: "광주 문정",
        division: "남자클럽 3부",
        rank: 2,
        tournament: "제12회 영암 월출산배 전국 남.녀 배구대회",
      },
      {
        teamName: "목포 하나",
        division: "남자클럽 3부",
        rank: 3,
        tournament: "제12회 영암 월출산배 전국 남.녀 배구대회",
      },
      {
        teamName: "진도 GO",
        division: "남자클럽 3부",
        rank: 3,
        tournament: "제12회 영암 월출산배 전국 남.녀 배구대회",
      },

      // 여자클럽 3부
      {
        teamName: "광주 썬클럽",
        division: "여자클럽 3부",
        rank: 1,
        tournament: "제12회 영암 월출산배 전국 남.녀 배구대회",
      },
      {
        teamName: "전주 토리",
        division: "여자클럽 3부",
        rank: 2,
        tournament: "제12회 영암 월출산배 전국 남.녀 배구대회",
      },
      {
        teamName: "사천 아자",
        division: "여자클럽 3부",
        rank: 3,
        tournament: "제12회 영암 월출산배 전국 남.녀 배구대회",
      },
      {
        teamName: "목포 유달",
        division: "여자클럽 3부",
        rank: 3,
        tournament: "제12회 영암 월출산배 전국 남.녀 배구대회",
      },

      // 남자 시니어부
      {
        teamName: "광주 문정",
        division: "남자 시니어부",
        rank: 1,
        tournament: "제12회 영암 월출산배 전국 남.녀 배구대회",
      },
      {
        teamName: "광주 무등산",
        division: "남자 시니어부",
        rank: 2,
        tournament: "제12회 영암 월출산배 전국 남.녀 배구대회",
      },
      {
        teamName: "목포 SMC",
        division: "남자 시니어부",
        rank: 3,
        tournament: "제12회 영암 월출산배 전국 남.녀 배구대회",
      },
      {
        teamName: "광주 무등산",
        division: "남자 시니어부",
        rank: 3,
        tournament: "제12회 영암 월출산배 전국 남.녀 배구대회",
      },
    ]

    this.addTournament("제12회 영암 월출산배 전국 남.녀 배구대회", tournament34Results, "2025.8.23.-2025.8.24.")
  }

  private getRegion(teamName: string): string {
    if (teamName === "광주 문정") {
      console.log("[v0] Calculating region for 광주 문정")
    }

    if (teamName.includes("광주")) {
      if (teamName === "광주 문정") {
        console.log("[v0] 광주 문정 matched 광주 condition, returning 전라권")
      }
      return "전라권"
    }

    if (teamName.includes("광명")) return "수도권"
    if (teamName.includes("과천시")) return "수도권"
    if (teamName.includes("일산")) {
      return "수도권"
    }
    if (
      teamName.includes("서울") ||
      teamName.includes("인천") ||
      teamName.includes("경기") ||
      teamName.includes("수원") ||
      teamName.includes("안양") ||
      teamName.includes("성남") ||
      teamName.includes("고양") ||
      teamName.includes("용인") ||
      teamName.includes("부천") ||
      teamName.includes("안산") ||
      teamName.includes("남양주") ||
      teamName.includes("화성") ||
      teamName.includes("평택") ||
      teamName.includes("의정부") ||
      teamName.includes("시흥") ||
      teamName.includes("파주") ||
      teamName.includes("김포") ||
      teamName.includes("군포") ||
      teamName.includes("오산") ||
      teamName.includes("이천") ||
      teamName.includes("양주") ||
      teamName.includes("구리") ||
      teamName.includes("안성") ||
      teamName.includes("포천") ||
      teamName.includes("의왕") ||
      teamName.includes("하남") ||
      teamName.includes("여주") ||
      teamName.includes("양평") ||
      teamName.includes("동두천") ||
      teamName.includes("과천") ||
      teamName.includes("가평") ||
      teamName.includes("연천")
    ) {
      return "수도권"
    }
    if (
      teamName.includes("부산") ||
      teamName.includes("울산") ||
      teamName.includes("대구") ||
      teamName.includes("창원") ||
      teamName.includes("진주") ||
      teamName.includes("김해") ||
      teamName.includes("포항") ||
      teamName.includes("경주") ||
      teamName.includes("구미") ||
      teamName.includes("양산") ||
      teamName.includes("거제") ||
      teamName.includes("통영") ||
      teamName.includes("사천") ||
      teamName.includes("밀양") ||
      teamName.includes("경산") ||
      teamName.includes("안동") ||
      teamName.includes("김천") ||
      teamName.includes("충무") ||
      teamName.includes("마산") ||
      teamName.includes("진해") ||
      teamName.includes("경남") ||
      teamName.includes("경북") ||
      teamName.includes("영천") ||
      teamName.includes("상주") ||
      teamName.includes("문경") ||
      teamName.includes("군위") ||
      teamName.includes("의성") ||
      teamName.includes("청송") ||
      teamName.includes("영양") ||
      teamName.includes("영덕") ||
      teamName.includes("청도") ||
      teamName.includes("고령") ||
      teamName.includes("성주") ||
      teamName.includes("칠곡") ||
      teamName.includes("예천") ||
      teamName.includes("봉화") ||
      teamName.includes("울진") ||
      teamName.includes("울릉") ||
      teamName.includes("의령") ||
      teamName.includes("함안") ||
      teamName.includes("창녕") ||
      teamName.includes("고성") ||
      teamName.includes("남해") ||
      teamName.includes("하동") ||
      teamName.includes("산청") ||
      teamName.includes("함양") ||
      teamName.includes("거창") ||
      teamName.includes("합천")
    ) {
      return "경상권"
    }
    if (
      teamName.includes("대전") ||
      teamName.includes("세종") ||
      teamName.includes("충남") ||
      teamName.includes("충북") ||
      teamName.includes("천안") ||
      teamName.includes("청주") ||
      teamName.includes("공주") ||
      teamName.includes("보령") ||
      teamName.includes("아산") ||
      teamName.includes("서산") ||
      teamName.includes("논산") ||
      teamName.includes("계룡") ||
      teamName.includes("당진") ||
      teamName.includes("금산") ||
      teamName.includes("부여") ||
      teamName.includes("서천") ||
      teamName.includes("청양") ||
      teamName.includes("홍성") ||
      teamName.includes("예산") ||
      teamName.includes("태안") ||
      teamName.includes("서대전") ||
      teamName.includes("충주") ||
      teamName.includes("제천") ||
      teamName.includes("보은") ||
      teamName.includes("옥천") ||
      teamName.includes("영동") ||
      teamName.includes("진천") ||
      teamName.includes("괴산") ||
      teamName.includes("음성") ||
      teamName.includes("단양") ||
      teamName.includes("증평")
    ) {
      return "충청권"
    }
    if (
      teamName.includes("전주") ||
      teamName.includes("군산") ||
      teamName.includes("익산") ||
      teamName.includes("정읍") ||
      teamName.includes("남원") ||
      teamName.includes("김제") ||
      teamName.includes("완주") ||
      teamName.includes("진안") ||
      teamName.includes("무주") ||
      teamName.includes("장수") ||
      teamName.includes("임실") ||
      teamName.includes("순창") ||
      teamName.includes("고창") ||
      teamName.includes("부안") ||
      teamName.includes("목포") ||
      teamName.includes("여수") ||
      teamName.includes("순천") ||
      teamName.includes("나주") ||
      teamName.includes("광양") ||
      teamName.includes("담양") ||
      teamName.includes("곡성") ||
      teamName.includes("구례") ||
      teamName.includes("고흥") ||
      teamName.includes("보성") ||
      teamName.includes("화순") ||
      teamName.includes("장흥") ||
      teamName.includes("강진") ||
      teamName.includes("해남") ||
      teamName.includes("영암") ||
      teamName.includes("무안") ||
      teamName.includes("함평") ||
      teamName.includes("영광") ||
      teamName.includes("장성") ||
      teamName.includes("완도") ||
      teamName.includes("진도") ||
      teamName.includes("신안") ||
      teamName.includes("전남") ||
      teamName.includes("전북")
    ) {
      return "전라권"
    }
    if (
      teamName.includes("강원") ||
      teamName.includes("춘천") ||
      teamName.includes("원주") ||
      teamName.includes("강릉") ||
      teamName.includes("동해") ||
      teamName.includes("태백") ||
      teamName.includes("속초") ||
      teamName.includes("삼척") ||
      teamName.includes("홍천") ||
      teamName.includes("횡성") ||
      teamName.includes("영월") ||
      teamName.includes("평창") ||
      teamName.includes("정선") ||
      teamName.includes("철원") ||
      teamName.includes("화천") ||
      teamName.includes("양구") ||
      teamName.includes("인제") ||
      teamName.includes("고성") ||
      teamName.includes("양양")
    ) {
      return "강원권"
    }
    if (teamName.includes("제주") || teamName.includes("서귀포")) {
      return "제주권"
    }
    return "기타"
  }

  // 팀 상세 정보 가져오기
  getTeamRegion(teamName: string): string {
    const region = this.getRegion(teamName)
    if (teamName === "광주 문정") {
      console.log("[v0] getTeamRegion for 광주 문정 returning:", region)
    }
    return region
  }
}

// 전역 데이터 프로세서 인스턴스
export const volleyballData = new VolleyballDataProcessor()

// 데이터 초기화 실행
volleyballData.initializeRealData()
