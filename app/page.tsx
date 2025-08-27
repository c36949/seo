"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, MapPin, Plus } from "lucide-react"
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

const MENS_DIVISIONS = [
  "남자클럽 3부",
  "남자 장년부",
  "남자 대학부",
  "남자 국제부",
  "남자 시니어부",
  "남자 실버부",
  "남자클럽 2부",
]

const WOMENS_DIVISIONS = ["여자클럽 3부", "여자 장년부", "여자 대학부", "여자 국제부"]

const REGIONS = ["전체권역", "수도권", "충청권", "전라권", "경상권", "강원권", "제주권"]

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
  selectedRegion,
}: {
  division: string
  teams: TeamData[]
  onTeamClick: (team: TeamData) => void
  selectedRegion: string
}) {
  let divisionTeams: TeamData[]

  if (division === "모든부 종합") {
    divisionTeams = volleyballData.getDivisionRankings().map(
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
  } else {
    divisionTeams = volleyballData.getDivisionRankings(division).map(
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
  }

  if (selectedRegion !== "전체권역") {
    const regionName = selectedRegion.replace("권", "권")
    divisionTeams = divisionTeams.filter((team) => team.region === regionName)
  }

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
      <table className="w-full min-w-[340px]">
        <thead className="bg-gradient-to-r from-gray-50 to-blue-50 sticky top-0 border-b-2 border-blue-200">
          <tr>
            <th className="px-1 py-2 text-center font-bold text-gray-900 text-xs w-8 md:text-lg">🏆</th>
            <th className="px-2 py-2 text-left font-bold text-gray-900 text-xs min-w-[70px] md:min-w-[200px] md:text-lg">
              팀명
            </th>
            <th className="px-1 py-2 text-center font-bold text-gray-900 text-xs w-12 md:px-8 md:w-auto md:text-lg">
              권역
            </th>
            <th className="px-1 py-2 text-center font-bold text-yellow-600 text-base w-8 md:px-8 md:w-auto md:text-lg">
              <span className="md:hidden">🥇</span>
              <span className="hidden md:inline">🥇 우승</span>
            </th>
            <th className="px-1 py-2 text-center font-bold text-gray-500 text-base w-8 md:px-8 md:w-auto md:text-lg">
              <span className="md:hidden">🥈</span>
              <span className="hidden md:inline">🥈 준우승</span>
            </th>
            <th className="px-1 py-2 text-center font-bold text-orange-600 text-base w-8 md:px-8 md:w-auto md:text-lg">
              <span className="md:hidden">🥉</span>
              <span className="hidden md:inline">🥉 3위</span>
            </th>
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
              <td className="px-1 py-2">
                <div className="flex items-center justify-center">
                  <span
                    className={`text-xs md:text-base font-bold ${
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
                </div>
              </td>
              <td className="px-1 py-2 md:px-6 md:py-4 md:min-w-[200px]">
                <button
                  className="text-left hover:text-blue-600 font-semibold text-xs md:text-lg transition-colors w-full text-ellipsis overflow-hidden whitespace-nowrap"
                  onClick={() => onTeamClick(team)}
                >
                  {team.teamName}
                </button>
              </td>
              <td className="px-1 py-2 text-center md:px-8 md:py-4">
                <Badge variant="outline" className="text-xs font-medium text-green-600 border-green-300 px-1 py-0">
                  {team.region}
                </Badge>
              </td>
              <td className="px-1 py-2 text-center md:px-8 md:py-4">
                <button
                  className="bg-gradient-to-r from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 text-yellow-800 px-1 py-0.5 rounded-full text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md min-w-[18px] md:px-3 md:py-1 md:text-sm"
                  onClick={() => onTeamClick(team)}
                >
                  {team.championships}
                </button>
              </td>
              <td className="px-1 py-2 text-center md:px-8 md:py-4">
                <button
                  className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 px-1 py-0.5 rounded-full text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md min-w-[18px] md:px-3 md:py-1 md:text-sm"
                  onClick={() => onTeamClick(team)}
                >
                  {team.runnerUps}
                </button>
              </td>
              <td className="px-1 py-2 text-center md:px-8 md:py-4">
                <button
                  className="bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 text-orange-800 px-1 py-0.5 rounded-full text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md min-w-[18px] md:px-3 md:py-1 md:text-sm"
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
  )
}

export default function VolleyballRanking() {
  const [selectedDivision, setSelectedDivision] = useState("남자클럽 3부")
  const [selectedRegion, setSelectedRegion] = useState("전체권역")
  const [currentView, setCurrentView] = useState<"home" | "regional">("home")
  const [filteredTeams, setFilteredTeams] = useState<TeamData[]>([])
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [tournamentStats, setTournamentStats] = useState({ totalTournaments: 0, totalTeams: 0, totalResults: 0 })
  const [tournamentNames, setTournamentNames] = useState<string[]>([])
  const [tournamentNamesWithDates, setTournamentNamesWithDates] = useState<Array<{ name: string; dates: string }>>([])
  const [showAllTournaments, setShowAllTournaments] = useState(false)
  const [showAllTournamentsList, setShowAllTournamentsList] = useState(false)
  const [showRegionMap, setShowRegionMap] = useState(false)

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

  const handleTeamClick = (team: TeamData) => {
    setSelectedTeam(team)
  }

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
    setCurrentView("home")
  }

  const divisions = volleyballData.getAllDivisions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 shadow-2xl">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="flex flex-col items-center">
                <div className="text-xs md:text-sm text-yellow-300 font-bold mb-10 -mt-24">"마스코트 호랭이"</div>
                <img
                  src="/images/tiger-head.png"
                  alt="랭구랭구 Tiger Head"
                  className="w-30 h-30 md:w-48 md:h-48 object-contain"
                />
                <div className="text-center -mt-2 md:-mt-6">
                  <div className="text-sm md:text-2xl font-bold text-white mb-1">랭구랭구</div>
                  <div className="text-xs md:text-sm text-blue-100">
                    <span className="font-bold text-yellow-300">랭</span>킹+배
                    <span className="font-bold text-yellow-300">구</span>=랭구
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-xl md:text-4xl font-bold text-white mb-1">전국 배구 클럽 랭킹</h1>
                <p className="text-blue-100 text-xs md:text-lg">National Volleyball Club Rankings</p>
                <p className="text-blue-200 text-xs md:text-sm">34개 대회 분석 완료</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="md:hidden fixed bottom-4 right-4 flex flex-col space-y-2 z-40">
        <Button
          variant={currentView === "home" ? "secondary" : "outline"}
          onClick={() => setCurrentView("home")}
          className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg text-sm px-3 py-2"
        >
          <Users className="w-4 h-4 mr-1" />
          부별
        </Button>
        <Button
          variant={currentView === "regional" ? "secondary" : "outline"}
          onClick={() => setCurrentView("regional")}
          className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg text-sm px-3 py-2"
        >
          <MapPin className="w-4 h-4 mr-1" />
          권역
        </Button>
      </div>

      <main className="container mx-auto px-4 py-8">
        {currentView === "home" && dataLoaded && (
          <div className="space-y-4 md:space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 text-white p-3 md:p-4">
                <CardTitle className="text-lg md:text-xl flex items-center">
                  <img src="/images/volleyball-small.png" alt="Volleyball" className="w-8 h-8 md:w-9 md:h-9 mr-2" />
                  부별 선택
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">남자부</div>
                  <div className="flex flex-wrap gap-2">
                    {MENS_DIVISIONS.map((division) => (
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
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">여자부</div>
                  <div className="flex flex-wrap gap-2">
                    {WOMENS_DIVISIONS.map((division) => (
                      <Button
                        key={division}
                        variant={selectedDivision === division ? "default" : "outline"}
                        onClick={() => setSelectedDivision(division)}
                        className={`text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 ${
                          selectedDivision === division
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                            : "hover:bg-pink-50"
                        }`}
                      >
                        {division}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white p-3 md:p-4">
                <CardTitle className="text-lg md:text-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <img src="/images/volleyball-small.png" alt="Volleyball" className="w-8 h-8 md:w-9 md:h-9 mr-2" />
                    권역별 선택
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRegionMap(!showRegionMap)}
                    className="text-white border-white hover:bg-white hover:text-green-600 text-xs px-2 py-1"
                  >
                    {showRegionMap ? "지도 숨기기" : "권역 보기"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4">
                {showRegionMap ? (
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="flex-1 md:max-w-sm">
                      <div className="relative">
                        <img
                          src="/images/korea-regions-map.png"
                          alt="Korea Regions Map"
                          className="w-full max-w-xs mx-auto md:max-w-sm"
                        />
                      </div>
                    </div>
                    <div className="hidden md:flex flex-1">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">권역별 선택</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {REGIONS.map((region) => (
                            <Button
                              key={region}
                              variant={selectedRegion === region ? "default" : "outline"}
                              onClick={() => setSelectedRegion(region)}
                              className={`w-full justify-center p-2 h-auto text-sm ${
                                selectedRegion === region
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                  : "hover:bg-gray-50 border"
                              }`}
                            >
                              <span className="font-medium">{region}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className={showRegionMap ? "md:hidden mt-3" : ""}>
                  <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                    {REGIONS.map((region) => (
                      <Button
                        key={region}
                        variant={selectedRegion === region ? "default" : "outline"}
                        onClick={() => setSelectedRegion(region)}
                        className={`text-xs px-2 py-1 h-7 flex-shrink-0 ${
                          selectedRegion === region
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            : "hover:bg-gray-50 border"
                        }`}
                      >
                        {region}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 text-white p-2 md:p-4">
                <CardTitle className="text-xl md:text-2xl flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                  <div className="flex items-center">
                    <img
                      src="/images/podium-mascots.png"
                      alt="Podium Mascots"
                      className="w-36 h-36 md:w-54 md:h-54 mr-2 md:mr-3 object-contain"
                    />
                    <div className="flex items-center">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold">{selectedDivision}</div>
                        <div className="text-2xl md:text-3xl font-bold">순위표</div>
                        {selectedRegion !== "전체권역" && (
                          <div className="text-base md:text-lg text-blue-100 mt-1">📍 {selectedRegion}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-sm md:text-lg font-bold">
                      {selectedDivision === "모든부 종합"
                        ? filteredTeams.length
                        : filteredTeams.filter((t) => t.division === selectedDivision).length}
                      개 팀
                    </div>
                    <div className="text-xs md:text-sm text-blue-100">
                      {tournamentStats.totalTournaments}개 대회 집계
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DivisionRankingTable
                  division={selectedDivision}
                  teams={filteredTeams}
                  onTeamClick={handleTeamClick}
                  selectedRegion={selectedRegion}
                />
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0">
              <CardContent className="p-4 md:p-6">
                <div className="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border border-blue-200">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
                    <span className="font-semibold text-gray-700">📅 2025년 전국 배구대회 종합 집계:</span>
                    <Badge className="bg-blue-500 text-white px-2 md:px-3 py-1">
                      {tournamentStats.totalTournaments}/34 대회
                    </Badge>
                    <Badge className="bg-green-500 text-white px-2 md:px-3 py-1">
                      {tournamentStats.totalTeams}개 팀
                    </Badge>
                    <Badge className="bg-purple-500 text-white px-2 md:px-3 py-1">
                      {tournamentStats.totalResults}개 결과
                    </Badge>
                    {tournamentStats.totalTournaments < 34 && (
                      <Badge className="bg-orange-500 text-white px-2 md:px-3 py-1 animate-pulse">
                        <Plus className="w-3 h-3 mr-1" />
                        대회 추가 대기중
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 p-2 md:p-3 bg-white rounded-lg border border-gray-200">
                    <div className="space-y-2">
                      <span className="font-semibold text-gray-700 block mb-3">📋 반영된 대회 목록:</span>
                      <div className="space-y-2">
                        {(showAllTournamentsList ? tournamentNamesWithDates : tournamentNamesWithDates.slice(0, 3)).map(
                          (tournament, index) => (
                            <div
                              key={index}
                              className="block w-full p-2 md:p-3 bg-gray-50 rounded border-l-4 border-blue-400"
                            >
                              <div className="flex justify-between items-center">
                                <span className="block text-sm font-medium text-gray-800">
                                  {index + 1}. {tournament.name}
                                </span>
                                <span className="text-blue-600 font-medium text-xs whitespace-nowrap ml-2">
                                  {tournament.dates}
                                </span>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                      {tournamentNamesWithDates.length > 3 && (
                        <div className="text-center pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAllTournamentsList(!showAllTournamentsList)}
                            className="text-xs px-3 py-1 hover:bg-blue-50"
                          >
                            {showAllTournamentsList ? "접기" : `더보기 (${tournamentNamesWithDates.length - 3}개 더)`}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    📅 2025년 전국 배구대회 종합 집계
                    {tournamentStats.totalTournaments < 34 && (
                      <span className="ml-2 text-orange-600 font-medium">
                        • 추가 대회 데이터를 입력해주세요 ({34 - tournamentStats.totalTournaments}개 대회 남음)
                      </span>
                    )}
                  </div>
                </div>
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
                    <span>🏆 총 {selectedTeam.tournaments.length}개 대회 입상</span>
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
                  {(showAllTournaments ? selectedTeam.tournaments : selectedTeam.tournaments.slice(0, 3)).map(
                    (tournament, index) => (
                      <div key={index} className="flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{tournament.tournament}</div>
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
                    ),
                  )}
                  {selectedTeam.tournaments.length > 3 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAllTournaments(!showAllTournaments)}
                        className="text-xs px-3 py-1"
                      >
                        {showAllTournaments
                          ? `접기 (${selectedTeam.tournaments.length - 3}개 숨기기)`
                          : `더보기 (${selectedTeam.tournaments.length - 3}개 더)`}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
