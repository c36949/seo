"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Trophy, Medal, Award, Filter, Users, MapPin, Calendar } from "lucide-react"
import { dataManager, type Team, type VolleyballDatabase } from "@/lib/volleyball-data"
import { RegionalMap } from "@/components/regional-map"
import { TeamDetailModal } from "@/components/team-detail-modal"
import { MedalTooltip } from "@/components/medal-tooltip"
import { BadgeCollection } from "@/components/ranking-badge"

export default function VolleyballRanking() {
  const [data, setData] = useState<VolleyballDatabase | null>(null)
  const [selectedSeason, setSelectedSeason] = useState("2024")
  const [selectedDivision, setSelectedDivision] = useState("전체")
  const [selectedRegion, setSelectedRegion] = useState("전체")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState<"home" | "regional">("home")
  const [loading, setLoading] = useState(true)
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const volleyballData = await dataManager.loadData()
        setData(volleyballData)
        setFilteredTeams(volleyballData.teams)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!data) return

    let teams = data.teams

    if (searchQuery.trim()) {
      teams = teams.filter(
        (team) =>
          team.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.region.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    const rankedTeams = dataManager.getRankedTeams(teams, selectedDivision, selectedRegion)
    setFilteredTeams(rankedTeams)
  }, [data, selectedDivision, selectedRegion, searchQuery])

  const handleSearch = () => {
    console.log("Searching with:", { selectedSeason, selectedDivision, selectedRegion, searchQuery })
  }

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team)
    setIsModalOpen(true)
  }

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
    setCurrentView("home")
  }

  const getRankBadgeColor = (index: number) => {
    if (index === 0) return "bg-yellow-500 text-white"
    if (index === 1) return "bg-gray-400 text-white"
    if (index === 2) return "bg-orange-500 text-white"
    return "bg-blue-100 text-blue-800"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">배구 랭킹 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <p className="text-lg text-red-600">데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <header className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">전국 배구클럽 랭킹</h1>
                <p className="text-gray-600">National Volleyball Club Rankings</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={currentView === "home" ? "default" : "outline"}
                onClick={() => setCurrentView("home")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Users className="w-4 h-4 mr-2" />
                부별 랭킹
              </Button>
              <Button
                variant={currentView === "regional" ? "default" : "outline"}
                onClick={() => setCurrentView("regional")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <MapPin className="w-4 h-4 mr-2" />
                권역별 랭킹
              </Button>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">검색 및 필터</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    시즌
                  </label>
                  <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024년</SelectItem>
                      <SelectItem value="2023">2023년</SelectItem>
                      <SelectItem value="2022">2022년</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Trophy className="w-4 h-4 mr-1" />
                    부별
                  </label>
                  <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="전체">전체 부</SelectItem>
                      {data.divisions.map((division) => (
                        <SelectItem key={division} value={division}>
                          {division} ({data.division_counts[division] || 0}팀)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    권역
                  </label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="전체">전체 권역</SelectItem>
                      {data.regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region} ({data.region_counts[region] || 0}팀)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">팀명 검색</label>
                  <Input
                    placeholder="팀명을 입력하세요..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 opacity-0">검색</label>
                  <Button onClick={handleSearch} className="w-full bg-green-600 hover:bg-green-700">
                    <Search className="w-4 h-4 mr-2" />
                    검색
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span>검색 결과:</span>
                <Badge variant="secondary">{filteredTeams.length}개 팀</Badge>
                {selectedDivision !== "전체" && <Badge variant="outline">{selectedDivision}</Badge>}
                {selectedRegion !== "전체" && <Badge variant="outline">{selectedRegion}</Badge>}
                {searchQuery && <Badge variant="outline">"{searchQuery}"</Badge>}
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === "home" && (
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-orange-600 text-white">
              <CardTitle className="text-2xl flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  {selectedDivision === "전체" ? "전체 부별" : selectedDivision} 순위표
                  {selectedRegion !== "전체" && ` - ${selectedRegion}`}
                </div>
                <div className="text-sm font-normal">총 {filteredTeams.length}개 팀</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">순위</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">팀명</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900">부</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900">권역</th>
                      <th className="px-6 py-4 text-center font-semibold text-yellow-600">🥇 우승</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-400">🥈 준우승</th>
                      <th className="px-6 py-4 text-center font-semibold text-orange-600">🥉 3위</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900">총계</th>
                      <th className="px-6 py-4 text-center font-semibold text-blue-600">점수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team, index) => {
                      const regionalRank = dataManager.getTeamRegionalRank(data.teams, team)
                      const divisionRank = dataManager.getTeamDivisionRank(data.teams, team)
                      const overallRank = dataManager.getTeamOverallRank(data.teams, team)

                      return (
                        <tr
                          key={team.id}
                          className={`border-b hover:bg-blue-50 transition-colors cursor-pointer ${
                            index < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : ""
                          }`}
                          onClick={() => handleTeamClick(team)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span
                                className={`text-lg font-bold ${
                                  index === 0
                                    ? "text-yellow-600"
                                    : index === 1
                                      ? "text-gray-500"
                                      : index === 2
                                        ? "text-orange-600"
                                        : "text-gray-700"
                                }`}
                              >
                                {index + 1}
                              </span>
                              {index < 3 && (
                                <div className="ml-2">
                                  {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                                  {index === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                                  {index === 2 && <Award className="w-5 h-5 text-orange-500" />}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <button
                                className="text-left hover:text-blue-600 font-medium transition-colors"
                                onClick={() => handleTeamClick(team)}
                              >
                                {team.team_name}
                              </button>
                              <BadgeCollection
                                team={team}
                                regionalRank={regionalRank}
                                divisionRank={divisionRank}
                                overallRank={overallRank}
                                compact={true}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{team.division}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{team.region}</td>
                          <td className="px-6 py-4 text-center">
                            <MedalTooltip medalType="wins" count={team.wins} teamName={team.team_name}>
                              <button
                                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold transition-colors"
                                onClick={() => handleTeamClick(team)}
                              >
                                {team.wins}
                              </button>
                            </MedalTooltip>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <MedalTooltip medalType="runner_ups" count={team.runner_ups} teamName={team.team_name}>
                              <button
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold transition-colors"
                                onClick={() => handleTeamClick(team)}
                              >
                                {team.runner_ups}
                              </button>
                            </MedalTooltip>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <MedalTooltip medalType="third_places" count={team.third_places} teamName={team.team_name}>
                              <button
                                className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold transition-colors"
                                onClick={() => handleTeamClick(team)}
                              >
                                {team.third_places}
                              </button>
                            </MedalTooltip>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {team.total_medals}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {team.ranking_score}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {filteredTeams.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-lg text-gray-600">검색 조건에 맞는 팀이 없습니다.</p>
                  <p className="text-sm text-gray-500 mt-2">다른 검색 조건을 시도해보세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentView === "regional" && data && <RegionalMap data={data} onRegionSelect={handleRegionSelect} />}
      </main>

      <TeamDetailModal
        team={selectedTeam}
        teamDetails={selectedTeam ? dataManager.getTeamDetails(selectedTeam.id) : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
