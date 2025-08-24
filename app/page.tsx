"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Trophy, Medal, Award, Filter, Users, MapPin, Calendar, Plus } from "lucide-react"
import { volleyballData, type DivisionTeamStats } from "@/lib/tournament-data-processor"

interface TeamData {
  teamName: string
  division: string
  region: string
  championships: number
  runnerUps: number
  thirdPlaces: number
  totalScore: number
  tournaments: Array<{
    tournament: string
    division: string
    teamName: string
    rank: number
  }>
}

const DIVISION_ORDER = [
  "남자클럽 3부",
  "여자클럽 3부",
  "남자 장년부",
  "여자 장년부",
  "남자 대학부",
  "여자 대학부",
  "남자클럽 2부",
  "남자 시니어부",
  "남자 실버부",
  "남자 국제부",
  "여자 국제부",
]

// 지역별 지도 컴포넌트
function RegionalMap({ onRegionSelect, selectedRegion, teamData }: RegionalMapProps) {
  const regions = [
    { name: "수도권", color: "bg-blue-500", teams: teamData.filter((t) => t.region === "수도권").length },
    { name: "충청권", color: "bg-green-500", teams: teamData.filter((t) => t.region === "충청권").length },
    { name: "전라권", color: "bg-red-500", teams: teamData.filter((t) => t.region === "전라권").length },
    { name: "경상권", color: "bg-purple-500", teams: teamData.filter((t) => t.region === "경상권").length },
    { name: "강원권", color: "bg-yellow-500", teams: teamData.filter((t) => t.region === "강원권").length },
    { name: "제주권", color: "bg-pink-500", teams: teamData.filter((t) => t.region === "제주권").length },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
      {regions.map((region) => (
        <button
          key={region.name}
          onClick={() => onRegionSelect(region.name)}
          className={`${region.color} hover:opacity-80 text-white p-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
            selectedRegion === region.name ? "ring-4 ring-white ring-opacity-50" : ""
          }`}
        >
          <div className="text-xl font-bold mb-2">{region.name}</div>
          <div className="text-sm opacity-90">{region.teams}개 팀</div>
        </button>
      ))}
    </div>
  )
}

interface RegionalMapProps {
  onRegionSelect: (region: string) => void
  selectedRegion: string
  teamData: TeamData[]
}

function DivisionRankingTable({
  division,
  teams,
  onTeamClick,
}: {
  division: string
  teams: TeamData[]
  onTeamClick: (team: TeamData) => void
}) {
  const divisionTeams = volleyballData.getDivisionRankings(division).map(
    (team: DivisionTeamStats): TeamData => ({
      teamName: team.teamName,
      division: team.division,
      region: team.region,
      championships: team.championships,
      runnerUps: team.runnerUps,
      thirdPlaces: team.thirdPlaces,
      totalScore: team.totalScore,
      tournaments: team.tournaments,
    }),
  )

  if (divisionTeams.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-orange-50 rounded-lg">
        <div className="text-gray-400 mb-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Trophy className="w-8 h-8" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">🏐 {division} 참가팀 없음</h3>
        <p className="text-gray-600">해당 부별에 참가한 팀이 없습니다.</p>
      </div>
    )
  }

  const teamsWithRanks = divisionTeams.map((team, index) => {
    let rank = 1

    // Find how many teams have better records
    for (let i = 0; i < index; i++) {
      const prevTeam = divisionTeams[i]
      if (
        prevTeam.championships > team.championships ||
        (prevTeam.championships === team.championships && prevTeam.runnerUps > team.runnerUps) ||
        (prevTeam.championships === team.championships &&
          prevTeam.runnerUps === team.runnerUps &&
          prevTeam.thirdPlaces > team.thirdPlaces)
      ) {
        rank++
      }
    }

    return { ...team, displayRank: rank }
  })

  return (
    <div className="overflow-x-auto">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50 sticky top-0 border-b-2 border-blue-200">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-gray-900 text-sm">🏆 순위</th>
              <th className="px-4 py-3 text-left font-bold text-gray-900 text-sm min-w-[150px]">🏐 팀명</th>
              <th className="px-3 py-3 text-center font-bold text-gray-900 text-sm">🗺️ 권역</th>
              <th className="px-3 py-3 text-center font-bold text-yellow-600 text-sm">🥇 우승</th>
              <th className="px-3 py-3 text-center font-bold text-gray-500 text-sm">🥈 준우승</th>
              <th className="px-3 py-3 text-center font-bold text-orange-600 text-sm">🥉 3위</th>
            </tr>
          </thead>
          <tbody>
            {teamsWithRanks.map((team, index) => (
              <tr
                key={`${team.teamName}-${team.division}`}
                className={`border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50 transition-all duration-200 cursor-pointer ${
                  team.displayRank <= 3
                    ? "bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-l-4 border-l-yellow-400"
                    : ""
                }`}
                onClick={() => onTeamClick(team)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <span
                      className={`text-lg font-bold mr-2 ${
                        team.displayRank === 1
                          ? "text-yellow-600"
                          : team.displayRank === 2
                            ? "text-gray-500"
                            : team.displayRank === 3
                              ? "text-orange-600"
                              : "text-gray-700"
                      }`}
                    >
                      {team.displayRank}
                    </span>
                    {team.displayRank <= 3 && (
                      <div className="flex items-center">
                        {team.displayRank === 1 && <Trophy className="w-5 h-5 text-yellow-500 animate-pulse" />}
                        {team.displayRank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                        {team.displayRank === 3 && <Award className="w-5 h-5 text-orange-500" />}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="text-left hover:text-blue-600 font-semibold text-base transition-colors w-full text-ellipsis overflow-hidden"
                    onClick={() => onTeamClick(team)}
                  >
                    {team.teamName}
                  </button>
                </td>
                <td className="px-3 py-3 text-center">
                  <Badge variant="outline" className="text-xs font-medium text-green-600 border-green-300">
                    {team.region}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-center">
                  <button
                    className="bg-gradient-to-r from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={() => onTeamClick(team)}
                  >
                    {team.championships}
                  </button>
                </td>
                <td className="px-3 py-3 text-center">
                  <button
                    className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={() => onTeamClick(team)}
                  >
                    {team.runnerUps}
                  </button>
                </td>
                <td className="px-3 py-3 text-center">
                  <button
                    className="bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 text-orange-800 px-3 py-1 rounded-full text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={() => onTeamClick(team)}
                  >
                    {team.thirdPlaces}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {teamsWithRanks.map((team, index) => (
          <div
            key={`${team.teamName}-${team.division}`}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              team.displayRank <= 3
                ? "bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-yellow-300"
                : "bg-white hover:bg-gray-50 border-gray-200"
            }`}
            onClick={() => onTeamClick(team)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span
                  className={`text-xl font-bold mr-3 ${
                    team.displayRank === 1
                      ? "text-yellow-600"
                      : team.displayRank === 2
                        ? "text-gray-500"
                        : team.displayRank === 3
                          ? "text-orange-600"
                          : "text-gray-700"
                  }`}
                >
                  {team.displayRank}위
                </span>
                {team.displayRank <= 3 && (
                  <div className="flex items-center">
                    {team.displayRank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                    {team.displayRank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                    {team.displayRank === 3 && <Award className="w-5 h-5 text-orange-500" />}
                  </div>
                )}
              </div>
              <Badge variant="outline" className="text-xs font-medium text-green-600 border-green-300">
                {team.region}
              </Badge>
            </div>

            <div className="mb-3">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{team.teamName}</h3>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-sm font-bold">
                    {team.championships}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">🥇</div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm font-bold">
                    {team.runnerUps}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">🥈</div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 px-2 py-1 rounded-full text-sm font-bold">
                    {team.thirdPlaces}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">🥉</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function VolleyballRanking() {
  const [selectedSeason, setSelectedSeason] = useState("2025")
  const [selectedDivision, setSelectedDivision] = useState("남자클럽 3부")
  const [selectedRegion, setSelectedRegion] = useState("전체")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState<"home" | "regional">("home")
  const [filteredTeams, setFilteredTeams] = useState<TeamData[]>([])
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [tournamentStats, setTournamentStats] = useState({ totalTournaments: 0, totalTeams: 0, totalResults: 0 })
  const [tournamentNames, setTournamentNames] = useState<string[]>([])
  const [tournamentNamesWithDates, setTournamentNamesWithDates] = useState<Array<{ name: string; dates: string }>>([])

  useEffect(() => {
    const loadTournamentData = async () => {
      try {
        const allTeams = volleyballData.getDivisionRankings().map(
          (team: DivisionTeamStats): TeamData => ({
            teamName: team.teamName,
            division: team.division,
            region: team.region,
            championships: team.championships,
            runnerUps: team.runnerUps,
            thirdPlaces: team.thirdPlaces,
            totalScore: team.totalScore,
            tournaments: team.tournaments,
          }),
        )

        setFilteredTeams(allTeams)
        setDataLoaded(true)
        const stats = volleyballData.getTournamentStats()
        setTournamentStats(stats)
        setTournamentNames(volleyballData.getAllTournamentNames())
        setTournamentNamesWithDates(volleyballData.getAllTournamentNamesWithDates())
        console.log("[v0] Real tournament data loaded:", allTeams.length, "teams")
      } catch (error) {
        console.error("[v0] Error loading tournament data:", error)
      }
    }

    loadTournamentData()
  }, [])

  const updateFilteredTeams = () => {
    let teams: TeamData[] = volleyballData.getDivisionRankings().map(
      (team: DivisionTeamStats): TeamData => ({
        teamName: team.teamName,
        division: team.division,
        region: team.region,
        championships: team.championships,
        runnerUps: team.runnerUps,
        thirdPlaces: team.thirdPlaces,
        totalScore: team.totalScore,
        tournaments: team.tournaments,
      }),
    )

    if (selectedRegion !== "전체") {
      teams = teams.filter((team) => team.region === selectedRegion)
    }

    if (searchQuery.trim()) {
      teams = teams.filter((team) => team.teamName.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredTeams(teams)
  }

  useEffect(() => {
    updateFilteredTeams()
  }, [selectedRegion, searchQuery])

  const handleTeamClick = (team: TeamData) => {
    setSelectedTeam(team)
    setIsModalOpen(true)
  }

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
    setCurrentView("home")
  }

  const divisions = volleyballData.getAllDivisions()
  const regions = volleyballData.getAllRegions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 shadow-2xl">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="relative">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-900">🏐</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">전국 배구클럽 부별 랭킹</h1>
                <p className="text-blue-100 text-sm md:text-lg">National Volleyball Club Division Rankings</p>
                <p className="text-blue-200 text-xs md:text-sm">
                  {dataLoaded
                    ? `${tournamentStats.totalTournaments}개 대회 집계 완료 - ${tournamentStats.totalTeams}개 팀 (${tournamentStats.totalResults}개 결과)`
                    : "데이터 로딩 중..."}
                </p>
              </div>
            </div>
            <div className="flex space-x-2 md:space-x-3">
              <Button
                variant={currentView === "home" ? "secondary" : "outline"}
                onClick={() => setCurrentView("home")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-sm"
              >
                <Users className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">부별 랭킹</span>
                <span className="sm:hidden">부별</span>
              </Button>
              <Button
                variant={currentView === "regional" ? "secondary" : "outline"}
                onClick={() => setCurrentView("regional")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-sm"
              >
                <MapPin className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">권역별 랭킹</span>
                <span className="sm:hidden">권역</span>
              </Button>
            </div>
          </div>

          {/* 필터 카드 */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center mr-2 md:mr-3">
                  <Filter className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800">검색 및 필터</h3>
                <div className="ml-auto text-xs md:text-sm text-gray-600">
                  현재 표시:{" "}
                  <span className="font-semibold text-blue-600">
                    {filteredTeams.filter((t) => t.division === selectedDivision).length}개 팀
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                    시즌
                  </label>
                  <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                    <SelectTrigger className="bg-white border-2 border-gray-200 hover:border-blue-400 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025년</SelectItem>
                      <SelectItem value="2024">2024년</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-green-500" />
                    권역
                  </label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="bg-white border-2 border-gray-200 hover:border-green-400 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="전체">전체 권역</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">팀명 검색</label>
                  <Input
                    placeholder="팀명을 입력하세요..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border-2 border-gray-200 hover:border-purple-400 focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 opacity-0">검색</label>
                  <Button
                    onClick={updateFilteredTeams}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    검색
                  </Button>
                </div>
              </div>

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border border-blue-200">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
                  <span className="font-semibold text-gray-700">🏐 대회 집계 현황:</span>
                  <Badge className="bg-blue-500 text-white px-2 md:px-3 py-1">
                    {tournamentStats.totalTournaments}/31 대회
                  </Badge>
                  <Badge className="bg-green-500 text-white px-2 md:px-3 py-1">{tournamentStats.totalTeams}개 팀</Badge>
                  <Badge className="bg-purple-500 text-white px-2 md:px-3 py-1">
                    {tournamentStats.totalResults}개 결과
                  </Badge>
                  {tournamentStats.totalTournaments < 31 && (
                    <Badge className="bg-orange-500 text-white px-2 md:px-3 py-1 animate-pulse">
                      <Plus className="w-3 h-3 mr-1" />
                      대회 추가 대기중
                    </Badge>
                  )}
                </div>
                <div className="mt-3 p-2 md:p-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-xs md:text-sm font-semibold text-gray-700 mb-2">📋 반영된 대회 목록:</div>
                  <div className="text-xs text-gray-600 space-y-1 max-h-32 md:max-h-40 overflow-y-auto">
                    {tournamentNamesWithDates.map((tournament, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="truncate mr-2">
                          {index + 1}. {tournament.name}
                        </span>
                        <span className="text-blue-600 font-medium text-xs whitespace-nowrap">{tournament.dates}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  📅 2025년 전국 배구대회 종합 집계 | 🏆 우승 5점, 준우승 3점, 3위 1점 기준
                  {tournamentStats.totalTournaments < 31 && (
                    <span className="ml-2 text-orange-600 font-medium">
                      • 추가 대회 데이터를 입력해주세요 ({31 - tournamentStats.totalTournaments}개 대회 남음)
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {tournamentStats.totalTournaments < 31 && (
          <Card className="mb-6 border-l-4 border-l-orange-500 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-orange-800">🏐 대회 데이터 집계 진행중</h3>
                  <p className="text-sm text-orange-700">
                    현재 {tournamentStats.totalTournaments}개 대회 완료, {31 - tournamentStats.totalTournaments}개 대회
                    추가 필요
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((tournamentStats.totalTournaments / 31) * 100)}%
                  </div>
                  <div className="text-xs text-orange-600">완료</div>
                </div>
              </div>
              <div className="mt-3 w-full bg-orange-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(tournamentStats.totalTournaments / 31) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentView === "home" && dataLoaded && (
          <div className="space-y-4 md:space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 text-white p-3 md:p-4">
                <CardTitle className="text-lg md:text-xl">🏐 부별 선택</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-wrap gap-2">
                  {DIVISION_ORDER.map((division) => (
                    <Button
                      key={division}
                      variant={selectedDivision === division ? "default" : "outline"}
                      onClick={() => setSelectedDivision(division)}
                      className={`text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 ${
                        selectedDivision === division
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          : "hover:bg-blue-50"
                      }`}
                    >
                      {division}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 text-white p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                  <div className="flex items-center">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center mr-2 md:mr-3">
                      <Trophy className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xl md:text-2xl font-bold">🏆 {selectedDivision} 순위표</div>
                      {selectedRegion !== "전체" && (
                        <div className="text-base md:text-lg text-blue-100 mt-1">📍 {selectedRegion} 권역</div>
                      )}
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-base md:text-lg font-bold">
                      {filteredTeams.filter((t) => t.division === selectedDivision).length}개 팀
                    </div>
                    <div className="text-sm text-blue-100">{tournamentStats.totalTournaments}개 대회 집계</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DivisionRankingTable division={selectedDivision} teams={filteredTeams} onTeamClick={handleTeamClick} />
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === "regional" && (
          <div className="space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <CardTitle className="text-2xl flex items-center">
                  <MapPin className="w-6 h-6 mr-2" />
                  🗺️ 권역별 배구클럽 분포 (인제 내린천배 대회)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <RegionalMap
                  onRegionSelect={handleRegionSelect}
                  selectedRegion={selectedRegion}
                  teamData={filteredTeams}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{selectedTeam.teamName}</h2>
                  <div className="flex flex-wrap space-x-2 md:space-x-4 text-xs md:text-sm">
                    <span>📋 {selectedTeam.division}</span>
                    <span>🗺️ {selectedTeam.region}</span>
                    <span>🏆 총 {selectedTeam.tournaments.length}개 대회 참가</span>
                  </div>
                </div>
                <button onClick={() => setSelectedTeam(null)} className="text-white hover:text-gray-200 text-2xl">
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="text-center p-3 md:p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-600">{selectedTeam.championships}</div>
                  <div className="text-xs md:text-sm text-gray-600">🥇 우승</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl md:text-3xl font-bold text-gray-600">{selectedTeam.runnerUps}</div>
                  <div className="text-xs md:text-sm text-gray-600">🥈 준우승</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl md:text-3xl font-bold text-orange-600">{selectedTeam.thirdPlaces}</div>
                  <div className="text-xs md:text-sm text-gray-600">🥉 3위</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl md:text-3xl font-bold text-green-600">{selectedTeam.tournaments.length}</div>
                  <div className="text-xs md:text-sm text-gray-600">🏆 입상횟수</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-bold">🏆 대회 참가 기록</h3>
                <div className="max-h-48 md:max-h-64 overflow-y-auto space-y-2">
                  {selectedTeam.tournaments.map((tournament, index) => (
                    <div key={index} className="flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{tournament.tournament}</div>
                        <div className="text-xs text-gray-600 mt-1">📋 {tournament.division}</div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Badge
                          className={
                            tournament.rank === 1
                              ? "bg-yellow-500"
                              : tournament.rank === 2
                                ? "bg-gray-400"
                                : tournament.rank === 3
                                  ? "bg-orange-500"
                                  : "bg-blue-400"
                          }
                        >
                          {tournament.rank === 1 ? "우승" : tournament.rank === 2 ? "준우승" : "3위"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
