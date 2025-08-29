"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, MapPin, Plus } from "lucide-react"
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
  tournamentNames,
}: {
  division: string
  teams: TeamData[]
  onTeamClick: (team: TeamData) => void
  selectedRegion: string
  tournamentNames: string[]
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

  const getBadgeForTeam = (team: any, rank: number) => {
    const badges = []

    // Get all teams for national ranking calculation
    const allNationalTeams = volleyballData.getDivisionRankings(division === "모든부 종합" ? undefined : division)

    // Calculate national ranking for this team
    let nationalRank = 1
    for (const otherTeam of allNationalTeams) {
      if (
        otherTeam.championships > team.championships ||
        (otherTeam.championships === team.championships && otherTeam.runnerUps > team.runnerUps) ||
        (otherTeam.championships === team.championships &&
          otherTeam.runnerUps === team.runnerUps &&
          otherTeam.thirdPlaces > team.thirdPlaces)
      ) {
        nationalRank++
      }
    }

    // Calculate regional #1 positions
    const regionalTeams = allNationalTeams.filter((t) => t.region === team.region)
    let regionalRank = 1
    for (const otherTeam of regionalTeams) {
      if (
        otherTeam.championships > team.championships ||
        (otherTeam.championships === team.championships && otherTeam.runnerUps > team.runnerUps) ||
        (otherTeam.championships === team.championships &&
          otherTeam.runnerUps === team.runnerUps &&
          otherTeam.thirdPlaces > team.thirdPlaces)
      ) {
        regionalRank++
      }
    }

    if (selectedRegion === "전체권역") {
      // In 전체권역 view: Only show regional #1 badges, but exclude "기타" region
      if (regionalRank === 1 && team.region !== "기타") {
        badges.push(
          <Badge
            key="regional-1"
            className="bg-gradient-to-r from-green-400 to-green-600 text-white text-xs px-2 py-0.5 ml-1"
          >
            {team.region} 1위
          </Badge>,
        )
      }
    } else {
      // In regional views: Show national ranking badges (1st to 10th place)
      if (nationalRank <= 10) {
        let badgeClass = ""
        if (nationalRank === 1) {
          badgeClass = "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
        } else if (nationalRank === 2) {
          badgeClass = "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
        } else if (nationalRank === 3) {
          badgeClass = "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
        } else if (nationalRank <= 5) {
          badgeClass = "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
        } else if (nationalRank <= 10) {
          badgeClass = "bg-gradient-to-r from-purple-400 to-purple-600 text-white"
        }

        badges.push(
          <Badge key={`national-${nationalRank}`} className={`${badgeClass} text-xs px-2 py-0.5 ml-1`}>
            전국 {nationalRank}위
          </Badge>,
        )
      }
    }

    return badges
  }

  const generateRankingAnalysis = () => {
    const analysisTitle =
      selectedRegion === "전체권역" ? `${division} 전국 순위 종합 분석` : `${division} ${selectedRegion} 순위 분석`

    // Calculate comprehensive statistics for detailed analysis
    const totalTeams = divisionTeams.length
    const totalChampionships = divisionTeams.reduce((sum, team) => sum + team.championships, 0)
    const totalRunnerUps = divisionTeams.reduce((sum, team) => sum + team.runnerUps, 0)
    const totalThirdPlaces = divisionTeams.reduce((sum, team) => sum + team.thirdPlaces, 0)

    const analyzeTournamentTrends = () => {
      const totalTournaments = 34 // Current total tournaments
      const earlyEnd = Math.ceil(totalTournaments / 3) // 1-11
      const midEnd = Math.ceil((totalTournaments * 2) / 3) // 12-22
      // Late period: 23-34

      const findTournamentIndex = (tournamentName: string) => {
        // First try exact match
        let index = tournamentNames.findIndex((name) => name === tournamentName)

        // If no exact match, try partial match
        if (index === -1) {
          index = tournamentNames.findIndex(
            (name) =>
              name.includes(tournamentName) || tournamentName.includes(name.split(" ")[0] + " " + name.split(" ")[1]),
          )
        }

        return index
      }

      const teamsWithPeriods = divisionTeams.map((team) => {
        const earlyTournaments = team.tournaments.filter((t) => {
          const tournamentIndex = findTournamentIndex(t.tournament)
          const tournamentNumber = tournamentIndex + 1
          const isEarly = tournamentIndex !== -1 && tournamentNumber >= 1 && tournamentNumber <= earlyEnd
          if (team.teamName === "전주 V9" || team.teamName === "목포하나") {
            console.log(
              `[v0] ${team.teamName} - ${t.tournament}: index=${tournamentIndex}, number=${tournamentNumber}, isEarly=${isEarly}`,
            )
          }
          return isEarly
        })

        const midTournaments = team.tournaments.filter((t) => {
          const tournamentIndex = findTournamentIndex(t.tournament)
          const tournamentNumber = tournamentIndex + 1
          const isMid = tournamentIndex !== -1 && tournamentNumber > earlyEnd && tournamentNumber <= midEnd
          if (team.teamName === "전주 V9" || team.teamName === "목포하나") {
            console.log(
              `[v0] ${team.teamName} - ${t.tournament}: index=${tournamentIndex}, number=${tournamentNumber}, isMid=${isMid}`,
            )
          }
          return isMid
        })

        const lateTournaments = team.tournaments.filter((t) => {
          const tournamentIndex = findTournamentIndex(t.tournament)
          const tournamentNumber = tournamentIndex + 1
          const isLate = tournamentIndex !== -1 && tournamentNumber > midEnd && tournamentNumber <= totalTournaments
          if (team.teamName === "전주 V9" || team.teamName === "목포하나") {
            console.log(
              `[v0] ${team.teamName} - ${t.tournament}: index=${tournamentIndex}, number=${tournamentNumber}, isLate=${isLate}`,
            )
          }
          return isLate
        })

        if (team.teamName === "전주 V9" || team.teamName === "목포하나") {
          console.log(
            `[v0] ${team.teamName} totals: early=${earlyTournaments.length}, mid=${midTournaments.length}, late=${lateTournaments.length}, total=${team.tournaments.length}`,
          )
        }

        return {
          ...team,
          earlyPerformance: earlyTournaments.length,
          midPerformance: midTournaments.length,
          latePerformance: lateTournaments.length,
        }
      })

      // 신흥 강자 (Rising Stars) - teams with increasing performance over time
      const risingStars = teamsWithPeriods
        .filter((team) => team.latePerformance > team.earlyPerformance && team.latePerformance >= 2)
        .sort((a, b) => b.latePerformance - b.earlyPerformance - (a.latePerformance - a.earlyPerformance))
        .slice(0, 3)

      // 잠자는 용 (Sleeping Dragons) - teams with early success but recent decline
      const sleepingDragons = teamsWithPeriods
        .filter((team) => team.earlyPerformance > team.latePerformance && team.earlyPerformance >= 2)
        .sort((a, b) => b.earlyPerformance - b.latePerformance - (a.earlyPerformance - a.latePerformance))
        .slice(0, 3)

      // 꾸준함 지수 (Consistency Index) - teams with steady performance across all periods
      const consistentPerformers = teamsWithPeriods
        .filter((team) => {
          const performances = [team.earlyPerformance, team.midPerformance, team.latePerformance]
          const maxDiff = Math.max(...performances) - Math.min(...performances)
          return maxDiff <= 1 && team.tournaments.length >= 3
        })
        .slice(0, 3)

      return { risingStars, sleepingDragons, consistentPerformers, earlyEnd, midEnd, totalTournaments }
    }

    // Advanced medal/ranking indicators
    const getAdvancedMetrics = () => {
      // 우승만 한 팀 (Championship-only teams)
      const championshipOnlyTeams = divisionTeams.filter(
        (team) => team.championships > 0 && team.runnerUps === 0 && team.thirdPlaces === 0,
      )

      // 준우승을 가장 많이 한 팀 (Most runner-ups)
      const mostRunnerUps = divisionTeams
        .filter((team) => team.runnerUps > 0)
        .sort((a, b) => b.runnerUps - a.runnerUps)
        .slice(0, 3)

      // 최소 결승은 간다 (Always reaches finals)
      const alwaysFinalists = divisionTeams.filter(
        (team) => team.thirdPlaces === 0 && (team.championships > 0 || team.runnerUps > 0),
      )

      // 최다 3위 입상 팀 (Most 3rd places)
      const mostThirdPlaces = divisionTeams
        .filter((team) => team.thirdPlaces > 0)
        .sort((a, b) => b.thirdPlaces - a.thirdPlaces)
        .slice(0, 3)

      // 홈/어웨이 성과 분석
      const getRegionFromTournament = (tournamentName: string) => {
        if (tournamentName.includes("인제") || tournamentName.includes("강릉") || tournamentName.includes("춘천"))
          return "강원권"
        if (
          tournamentName.includes("단양") ||
          tournamentName.includes("진천") ||
          tournamentName.includes("충주") ||
          tournamentName.includes("천안")
        )
          return "충청권"
        if (
          tournamentName.includes("전주") ||
          tournamentName.includes("광주") ||
          tournamentName.includes("목포") ||
          tournamentName.includes("순천")
        )
          return "전라권"
        if (
          tournamentName.includes("부산") ||
          tournamentName.includes("울산") ||
          tournamentName.includes("대구") ||
          tournamentName.includes("경주") ||
          tournamentName.includes("울진") ||
          tournamentName.includes("진안")
        )
          return "경상권"
        if (tournamentName.includes("제주")) return "제주권"
        if (
          tournamentName.includes("서울") ||
          tournamentName.includes("인천") ||
          tournamentName.includes("수원") ||
          tournamentName.includes("용인") ||
          tournamentName.includes("광명") ||
          tournamentName.includes("일산")
        )
          return "수도권"
        return "기타"
      }

      const teamsWithHomeAway = divisionTeams.map((team) => {
        const homeResults = team.tournaments.filter((t) => getRegionFromTournament(t.tournament) === team.region)
        const awayResults = team.tournaments.filter(
          (t) =>
            getRegionFromTournament(t.tournament) !== team.region && getRegionFromTournament(t.tournament) !== "기타",
        )

        return {
          ...team,
          homeCount: homeResults.length,
          awayCount: awayResults.length,
          homeWins: homeResults.filter((t) => t.rank === 1).length,
          awayWins: awayResults.filter((t) => t.rank === 1).length,
        }
      })

      // 어웨이 최강팀 (Best away performers)
      const bestAwayPerformers = teamsWithHomeAway
        .filter((team) => team.awayCount > 0)
        .sort((a, b) => b.awayCount - a.awayCount)
        .slice(0, 3)

      // 결승만 가면 우승하는 팀 (Teams that always win finals - excluding single wins)
      const finalsWinners = divisionTeams
        .filter((team) => team.championships > 1 && team.runnerUps === 0)
        .sort((a, b) => b.championships - a.championships)
        .slice(0, 3)

      return {
        championshipOnlyTeams,
        mostRunnerUps,
        alwaysFinalists,
        mostThirdPlaces,
        bestAwayPerformers,
        finalsWinners,
      }
    }

    const trendAnalysis = analyzeTournamentTrends()
    const advancedMetrics = getAdvancedMetrics()
    const regionDistribution = divisionTeams.reduce(
      (acc, team) => {
        const region = team.region === "기타" ? "수도권" : team.region
        acc[region] = (acc[region] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topPerformers = divisionTeams.sort((a, b) => b.championships - a.championships)

    // Calculate competition level
    const championshipLeaders = divisionTeams.filter((team) => team.championships > 0).length
    const consistentPerformers = divisionTeams.filter((team) => team.tournaments.length >= 3).length
    const competitionLevel =
      championshipLeaders / totalTeams > 0.5
        ? "높음 (High)"
        : championshipLeaders / totalTeams > 0.2
          ? "보통 (Medium)"
          : "낮음 (Low)"

    return (
      <Card className="mt-6 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardTitle className="text-lg md:text-xl flex items-center">
            <img src="/images/new-tiger-mascot.png" alt="Tiger Mascot" className="w-18 h-18 mr-3" />
            랭구랭구 인사이트 리포트
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-6">
            {/* 종합 개요 */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
              <h3 className="text-lg font-bold text-gray-800 mb-3">📊 {analysisTitle}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{totalTeams}</div>
                  <div className="text-sm text-gray-600">참가 팀 수</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{championshipLeaders}</div>
                  <div className="text-sm text-gray-600">우승 경험팀</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{consistentPerformers}</div>
                  <div className="text-sm text-gray-600">안정적 성과팀</div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {division}에는 총 <strong>{totalTeams}개 팀</strong>이 참가하여 치열한 경쟁을 펼치고 있습니다. 이 중{" "}
                <strong>{championshipLeaders}개 팀</strong>이 우승 경험을 보유하고 있으며,
                <strong>{consistentPerformers}개 팀</strong>이 3회 이상의 안정적인 입상 성과를 기록했습니다. 전체적인
                경쟁 수준은 <strong>{competitionLevel}</strong>으로 평가됩니다.
              </p>
            </div>

            {/* 트렌드 분석 */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
              <h3 className="text-lg font-bold text-gray-800 mb-3">📈 승부의 곡선 (초반~후반 성적 변화)</h3>

              {/* 신흥 강자 */}
              {trendAnalysis.risingStars.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🚀 신흥 강자 (후반부 급상승)</h4>
                  <div className="space-y-2">
                    {trendAnalysis.risingStars.map((team, index) => (
                      <div key={team.teamName} className="space-y-1">
                        <div className="font-medium">{team.teamName}</div>
                        <div className="text-sm text-green-600">
                          초반 {team.earlyPerformance}회 → 중반 {team.midPerformance}회 → 후반 {team.latePerformance}회
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    후반부 대회에서 급격한 성장세를 보이며 앞으로의 활약이 기대되는 팀들입니다.
                  </p>
                </div>
              )}

              {/* 잠자는 용 */}
              {trendAnalysis.sleepingDragons.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">🐉 잠자는 용 (초반 강세, 후반 약세)</h4>
                  <div className="space-y-2">
                    {trendAnalysis.sleepingDragons.map((team, index) => (
                      <div key={team.teamName} className="space-y-1">
                        <div className="font-medium">{team.teamName}</div>
                        <div className="text-sm text-red-600">
                          초반 {team.earlyPerformance}회 → 중반 {team.midPerformance}회 → 후반 {team.latePerformance}회
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-red-700 mt-2">
                    초반 강세를 보였지만 후반부 성적이 아쉬운 팀들로, 재기가 주목되는 팀들입니다.
                  </p>
                </div>
              )}

              {/* 꾸준함 지수 */}
              {trendAnalysis.consistentPerformers.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">⚖️ 꾸준함 지수 (전 기간 안정적 성과)</h4>
                  <div className="space-y-2">
                    {trendAnalysis.consistentPerformers.map((team, index) => (
                      <div key={team.teamName} className="space-y-1">
                        <div className="font-medium">{team.teamName}</div>
                        <div className="text-sm text-blue-600">
                          초반 {team.earlyPerformance}회, 중반 {team.midPerformance}회, 후반 {team.latePerformance}회
                          (총 {team.tournaments.length}회)
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    초반부터 후반부까지 꾸준한 성과를 내며 안정적인 경기력을 보여주는 믿을 만한 팀들입니다.
                  </p>
                </div>
              )}
            </div>

            {/* 메달/랭킹 심화 지표 */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🏆 랭킹 속 히든 스토리</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 완벽주의자 - 1st position */}
                {advancedMetrics.championshipOnlyTeams.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">👑 완벽주의자 (우승만)</h4>
                    <div className="space-y-1">
                      {advancedMetrics.championshipOnlyTeams.map((team) => (
                        <div key={team.teamName} className="text-sm">
                          <span className="font-medium">{team.teamName}</span>
                          <span className="text-yellow-600 ml-2">우승 {team.championships}회</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-yellow-700 mt-2">우승 아니면 입상하지 않는 승부사 기질의 팀들</p>
                  </div>
                )}

                {/* 결승의 신 - 2nd position */}
                {advancedMetrics.finalsWinners.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">🏆 결승의 신</h4>
                    <div className="space-y-1">
                      {advancedMetrics.finalsWinners.map((team) => (
                        <div key={team.teamName} className="text-sm">
                          <span className="font-medium">{team.teamName}</span>
                          <span className="text-yellow-600 ml-2">
                            결승 진출 시 {team.championships}전 {team.championships}승 (승률 100%)
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-yellow-700 mt-2">결승에만 가면 반드시 우승하는 클러치 팀들</p>
                  </div>
                )}

                {/* 아쉬운 2인자 - 3rd position */}
                {advancedMetrics.mostRunnerUps.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">🥈 아쉬운 2인자</h4>
                    <div className="space-y-1">
                      {advancedMetrics.mostRunnerUps.slice(0, 3).map((team) => (
                        <div key={team.teamName} className="text-sm">
                          <span className="font-medium">{team.teamName}</span>
                          <span className="text-gray-600 ml-2">준우승 {team.runnerUps}회</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-700 mt-2">한 발 차이로 아쉬웠던 순간들이 많은 팀들</p>
                  </div>
                )}

                {/* 무조건 파이널 - 4th position */}
                {advancedMetrics.alwaysFinalists.length > 0 && (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <h4 className="font-semibold text-indigo-800 mb-2">🎯 무조건 파이널</h4>
                    <div className="space-y-1">
                      {advancedMetrics.alwaysFinalists.slice(0, 3).map((team) => (
                        <div key={team.teamName} className="text-sm">
                          <span className="font-medium">{team.teamName}</span>
                          <span className="text-indigo-600 ml-2">
                            우승 {team.championships}회, 준우승 {team.runnerUps}회
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-indigo-700 mt-2">3위는 없고 우승과 준우승만 있는 결승 전문팀들</p>
                  </div>
                )}

                {/* 동메달 컬렉터 - 5th position */}
                {advancedMetrics.mostThirdPlaces.length > 0 && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">🥉 동메달 컬렉터</h4>
                    <div className="space-y-1">
                      {advancedMetrics.mostThirdPlaces.slice(0, 3).map((team) => (
                        <div key={team.teamName} className="text-sm">
                          <span className="font-medium">{team.teamName}</span>
                          <span className="text-orange-600 ml-2">3위 {team.thirdPlaces}회</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-orange-700 mt-2">꾸준히 상위권에 머물며 3위 입상이 많은 팀들</p>
                  </div>
                )}

                {/* 무적 원정대 - 6th position */}
                {advancedMetrics.bestAwayPerformers.length > 0 && (
                  <div className="p-3 bg-teal-50 rounded-lg">
                    <h4 className="font-semibold text-teal-800 mb-2">✈️ 무적 원정대</h4>
                    <div className="space-y-1">
                      {advancedMetrics.bestAwayPerformers.map((team) => (
                        <div key={team.teamName} className="text-sm">
                          <span className="font-medium">{team.teamName}</span>
                          <span className="text-teal-600 ml-2">
                            어웨이 입상 {team.awayCount}회 (우승 {team.awayWins}회)
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-teal-700 mt-2">타 지역에서도 뛰어난 실력을 발휘하는 원정 전문팀들</p>
                  </div>
                )}
              </div>
            </div>

            {/* 권역별 분포 분석 */}
            {selectedRegion === "전체권역" && Object.keys(regionDistribution).length > 1 && (
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                <h3 className="text-lg font-bold text-gray-800 mb-3">🥇 권역별 성적표</h3>

                {/* 권역별 상세 메달 분석 */}
                <div className="mb-6">
                  <h4 className="font-semibold text-green-800 mb-3">🏅 권역별 메달 상세 분석</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(regionDistribution)
                      .map(([region, teamCount]) => {
                        const regionTeams = divisionTeams.filter(
                          (team) => (team.region === "기타" ? "수도권" : team.region) === region,
                        )
                        const goldMedals = regionTeams.reduce((sum, team) => sum + team.championships, 0)
                        const silverMedals = regionTeams.reduce((sum, team) => sum + team.runnerUps, 0)
                        const bronzeMedals = regionTeams.reduce((sum, team) => sum + team.thirdPlaces, 0)
                        const totalMedals = goldMedals + silverMedals + bronzeMedals

                        return { region, teamCount, goldMedals, silverMedals, bronzeMedals, totalMedals }
                      })
                      .sort((a, b) => b.totalMedals - a.totalMedals)
                      .map(({ region, teamCount, goldMedals, silverMedals, bronzeMedals, totalMedals }) => (
                        <div key={region} className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border">
                          <div className="text-center mb-3">
                            <h5 className="font-bold text-lg text-gray-800">{region}</h5>
                            <p className="text-sm text-gray-600">{teamCount}개 팀 입상</p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">🥇 금메달</span>
                              <span className="font-bold text-yellow-600">{goldMedals}개</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">🥈 은메달</span>
                              <span className="font-bold text-gray-600">{silverMedals}개</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">🥉 동메달</span>
                              <span className="font-bold text-orange-600">{bronzeMedals}개</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-bold">총 메달</span>
                                <span className="font-bold text-green-600 text-lg">{totalMedals}개</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 권역별 금메달 분포 */}
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-3">👑 권역별 금메달 분포</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.entries(regionDistribution)
                      .map(([region]) => {
                        const regionTeams = divisionTeams.filter(
                          (team) => (team.region === "기타" ? "수도권" : team.region) === region,
                        )
                        const goldMedals = regionTeams.reduce((sum, team) => sum + team.championships, 0)
                        return { region, goldMedals }
                      })
                      .sort((a, b) => b.goldMedals - a.goldMedals)
                      .map(({ region, goldMedals }) => (
                        <div key={region} className="text-center p-3 bg-white rounded-lg border-2 border-yellow-200">
                          <div className="text-2xl font-bold text-yellow-600">{goldMedals}</div>
                          <div className="text-sm text-gray-700">{region}</div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 강한 권역 vs 약한 권역 분류 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const regionMedalData = Object.entries(regionDistribution)
                      .map(([region]) => {
                        const regionTeams = divisionTeams.filter(
                          (team) => (team.region === "기타" ? "수도권" : team.region) === region,
                        )
                        const totalMedals = regionTeams.reduce(
                          (sum, team) => sum + team.championships + team.runnerUps + team.thirdPlaces,
                          0,
                        )
                        return { region, totalMedals, teamCount: regionTeams.length }
                      })
                      .sort((a, b) => b.totalMedals - a.totalMedals)

                    const strongRegions = regionMedalData.slice(0, Math.ceil(regionMedalData.length / 2))
                    const weakRegions = regionMedalData.slice(Math.ceil(regionMedalData.length / 2))

                    return (
                      <>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-2">💪 강한 권역 (메달 다수 보유)</h4>
                          <div className="space-y-2">
                            {strongRegions.map(({ region, totalMedals, teamCount }) => (
                              <div key={region} className="flex justify-between items-center">
                                <span className="font-medium">{region}</span>
                                <span className="text-sm text-red-600">
                                  {totalMedals}개 메달 ({teamCount}팀)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">📈 성장 가능 권역</h4>
                          <div className="space-y-2">
                            {weakRegions.map(({ region, totalMedals, teamCount }) => (
                              <div key={region} className="flex justify-between items-center">
                                <span className="font-medium">{region}</span>
                                <span className="text-sm text-blue-600">
                                  {totalMedals}개 메달 ({teamCount}팀)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* 순위권 상위 10개팀의 권역별 분석 */}
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🏆 상위 10개팀 권역별 분포</h4>
                  {(() => {
                    const top10Teams = divisionTeams.slice(0, 10)
                    const top10RegionDist = top10Teams.reduce(
                      (acc, team) => {
                        const region = team.region === "기타" ? "수도권" : team.region
                        acc[region] = (acc[region] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    )

                    const dominantRegion = Object.entries(top10RegionDist).sort(([, a], [, b]) => b - a)[0]

                    return (
                      <>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                          {Object.entries(top10RegionDist)
                            .sort(([, a], [, b]) => b - a)
                            .map(([region, count]) => (
                              <div key={region} className="text-center p-2 bg-white rounded border">
                                <div className="text-lg font-bold text-green-600">{count}</div>
                                <div className="text-xs text-gray-600">{region}</div>
                              </div>
                            ))}
                        </div>
                        <p className="text-sm text-green-700">
                          상위 10개팀 중 <strong>{dominantRegion[0]}</strong>이 {dominantRegion[1]}개 팀으로 가장 많은
                          강팀을 보유하고 있어 해당 권역의 배구 수준이 높음을 보여줍니다.
                        </p>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* 앞으로의 예상 및 관전 포인트 */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🔮 앞으로의 예상 및 관전 포인트</h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">🐯 우승권 판도</h4>
                  <p className="text-sm text-red-700 leading-relaxed">
                    {topPerformers.length > 1 && topPerformers[0].championships - topPerformers[1].championships <= 1
                      ? `현재 1위 ${topPerformers[0].teamName}과 2위 ${topPerformers[1].teamName}의 격차가 근소하여 향후 순위 변동 가능성이 높습니다. `
                      : `${topPerformers[0]?.teamName}의 독주 체제가 공고하지만, 추격팀들의 성장세도 주목할 만합니다. `}
                    {trendAnalysis.risingStars.length > 0 &&
                      `특히 신흥 강자로 분류된 ${trendAnalysis.risingStars[0]?.teamName} 등의 약진이 기존 순위에 변화를 가져올 것으로 예상됩니다.`}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🏆 우승권 판도 키포인트</h4>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    {trendAnalysis.sleepingDragons.length > 0 && (
                      <li>잠자는 용 {trendAnalysis.sleepingDragons[0]?.teamName}의 재기 여부</li>
                    )}
                    {advancedMetrics.mostRunnerUps.length > 0 && (
                      <li>준우승 최다팀 {advancedMetrics.mostRunnerUps[0]?.teamName}의 우승 도전</li>
                    )}
                    {trendAnalysis.risingStars.length > 0 && <li>신흥 강자들의 지속적인 성장세 유지 가능성</li>}
                    <li>권역별 라이벌 구도의 변화와 새로운 강팀의 등장</li>
                  </ul>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">🏐 배구계 트렌드 분석</h4>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    전체적으로 {competitionLevel} 수준의 경쟁이 펼쳐지고 있으며,
                    {championshipLeaders / totalTeams > 0.3
                      ? "다수의 팀이 우승 경험을 보유하여 예측하기 어려운 흥미진진한 리그"
                      : "소수 강팀 중심의 안정적인 리그 구조"}
                    를 보이고 있습니다. 향후 대회에서는 기존 강팀들의 수성과 신흥 세력의 도전이 만나 더욱 치열한 경쟁이
                    예상됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
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
                  <div className="flex items-center flex-wrap">
                    <button
                      className="text-left hover:text-blue-600 font-semibold text-xs md:text-lg transition-colors text-ellipsis overflow-hidden whitespace-nowrap"
                      onClick={() => onTeamClick(team)}
                    >
                      {team.teamName}
                    </button>
                    <div className="flex flex-wrap">{getBadgeForTeam(team, team.displayRank)}</div>
                  </div>
                </td>
                <td className="px-1 py-2 text-center md:px-8 md:py-4">
                  <Badge variant="outline" className="text-xs font-medium text-green-600 border-green-300 px-1 py-0">
                    {team.region === "기타" ? "수도권" : team.region}
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

      {divisionTeams.length > 0 && generateRankingAnalysis()}
    </div>
  )
}

const tournamentData = [
  { dates: "8월30일~31일", name: "2025원주치악배전국남여배구대회", location: "강원원주", status: "결과" },
  { dates: "8월30일~31일", name: "2025. 강진청자배 시니어실버전국남녀배구대회", location: "전남강진", status: "결과" },
  { dates: "9월6일~7일", name: "제3회 대한스포츠클럽협회장배 전국 배구대회", location: "전남장성", status: "" },
  { dates: "9월13일~14일", name: "제5회 남해 보물섬배 전국남여생활체육배구대회", location: "경남남해", status: "결과" },
  { dates: "9월13일~14일", name: "2025당진해나루배전국남녀 생활체육배구대회", location: "충남당진", status: "결과" },
  { dates: "9월20일~21일", name: "중부매일배내토기전국생활체육배구대회", location: "충북제천", status: "결과" },
  { dates: "9월20일~21일", name: "온고을배시니어실버배구대회", location: "전북전주", status: "결과" },
  { dates: "9월27일~28일", name: "제57회청호배생활체육배구대회", location: "전남보성", status: "결과" },
  {
    dates: "10월11일~12일",
    name: "제10회광산구청장기(구.우리밀배)전국남.여배구대회",
    location: "광주광산",
    status: "",
  },
  { dates: "10월18일~19일", name: "제4회 고성공룡배 전국남녀배구대회", location: "경남고성", status: "결과" },
  { dates: "10월25일~26일", name: "제10회임금님표 이천쌀배전국배구대회", location: "경기이천", status: "결과" },
  { dates: "11월8일~9일", name: "제56회여수거북선기전국남여배구대회", location: "전남여수", status: "결과" },
  { dates: "11월15일~16일", name: "2025전주한옥마을배전국남여배구대회", location: "전북전주", status: "결과" },
  { dates: "11월29일~30일", name: "제56회 장흥군협회장기 전국 남.여 배구대회", location: "전남장흥", status: "결과" },
  { dates: "12월6일~7일", name: "제12회 진도아리랑배전국남녀배구대회", location: "전남진도", status: "결과" },
  { dates: "12월6일~7일", name: "제46회국무총리배 전국9인제배구대회", location: "충북단양", status: "결과" },
  { dates: "12월6일", name: "2025남원춘향배 시니어ㆍ실버전국남녀배구대회", location: "전북남원", status: "결과" },
  { dates: "12월13일~14일", name: "제6회 목포유달산배 전국 남,여배구대회", location: "전남목포", status: "결과" },
  { dates: "12월20일~21일", name: "제2회 완도풀 전국남여 생활체육 배구대회", location: "전남완도", status: "결과" },
  { dates: "12월20일~21일", name: "2025청양군체육회장배전국남여배구대회", location: "충남청양", status: "" },
]

const TournamentCalendar = () => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)

  const months = [
    { name: "8월", year: 2025, days: 31, startDay: 4 },
    { name: "9월", year: 2025, days: 30, startDay: 0 },
    { name: "10월", year: 2025, days: 31, startDay: 2 },
    { name: "11월", year: 2025, days: 30, startDay: 5 },
    { name: "12월", year: 2025, days: 31, startDay: 0 },
  ]

  const dayNames = ["월", "화", "수", "목", "금", "토", "일"]

  const getTournamentsForDate = (month: string, day: number) => {
    return tournamentData.filter((tournament) => {
      const dateStr = `${month}${day}일`

      // Check if tournament directly includes this date
      if (tournament.dates.includes(dateStr)) return true

      // Check if date is in tournament range
      if (tournament.dates.includes("~") && isDateInRange(month, day, tournament.dates)) return true

      // Check weekend tournament logic
      if (isWeekendTournament(tournament.dates, month, day)) return true

      // Check if this is Sunday and tournament started on Saturday
      if (isSundayAfterSaturdayTournament(tournament.dates, month, day)) return true

      return false
    })
  }

  const isSundayAfterSaturdayTournament = (dateRange: string, month: string, day: number) => {
    const currentMonth = months.find((m) => m.name === month)
    if (!currentMonth) return false

    const currentDayOfWeek = (currentMonth.startDay + day - 1) % 7

    // Only apply to Sundays (now index 6 instead of 0)
    if (currentDayOfWeek !== 6) return false

    // Check if previous day (Saturday) had a tournament
    const previousDay = day - 1
    if (previousDay < 1) return false

    const previousDayOfWeek = (currentMonth.startDay + previousDay - 1) % 7

    // Only apply if previous day was Saturday (now index 5 instead of 6)
    if (previousDayOfWeek !== 5) return false

    // Check if tournament starts on the previous Saturday
    const saturdayDateStr = `${month}${previousDay}일`

    // Check direct match or range start
    if (dateRange.includes(saturdayDateStr)) return true

    // Check if tournament starts on Saturday (for range tournaments)
    if (dateRange.includes("~")) {
      const [startStr] = dateRange.split("~")
      const startDay = Number.parseInt(startStr.replace(/[^0-9]/g, ""))
      if (dateRange.startsWith(month) && startDay === previousDay) return true
    }

    return false
  }

  const isDateInRange = (month: string, day: number, dateRange: string) => {
    if (!dateRange.includes("~")) return false

    const [startStr, endStr] = dateRange.split("~")
    const startDay = Number.parseInt(startStr.replace(/[^0-9]/g, ""))
    const endDay = Number.parseInt(endStr.replace(/[^0-9]/g, ""))

    return day >= startDay && day <= endDay && dateRange.startsWith(month)
  }

  const isWeekendTournament = (dateRange: string, month: string, day: number) => {
    if (!dateRange.includes("~")) return false

    const [startStr, endStr] = dateRange.split("~")
    const startDay = Number.parseInt(startStr.replace(/[^0-9]/g, ""))
    const endDay = Number.parseInt(endStr.replace(/[^0-9]/g, ""))

    // Check if this is a weekend tournament and current day is within weekend range
    if (dateRange.startsWith(month)) {
      const currentMonth = months.find((m) => m.name === month)
      if (currentMonth) {
        const startDayOfWeek = (currentMonth.startDay + startDay - 1) % 7
        const currentDayOfWeek = (currentMonth.startDay + day - 1) % 7

        // If tournament starts on Saturday or Sunday, show on both weekend days
        if ((startDayOfWeek === 5 || startDayOfWeek === 6) && (currentDayOfWeek === 5 || currentDayOfWeek === 6)) {
          return day >= startDay && day <= endDay
        }
      }
    }
    return false
  }

  const isWeekend = (dayOfWeek: number) => dayOfWeek === 5 || dayOfWeek === 6

  const extractLocationName = (tournamentName: string) => {
    // Extract location from tournament names like "2025 원주치악배" -> "원주"
    const locationPatterns = [
      /(\w+)치악배/, // 원주치악배 -> 원주
      /(\w+)청자배/, // 강진청자배 -> 강진
      /(\w+)춘향배/, // 남원춘향배 -> 남원
      /(\w+)보물섬배/, // 남해보물섬배 -> 남해
      /(\w+)해나루배/, // 당진해나루배 -> 당진
      /(\w+)매일배/, // 중부매일배 -> 중부
      /(\w+)배/, // 온고일배 -> 온고일
      /(\w+)청호배/, // 청호배 -> 청호
      /(\w+)구청장기/, // 광산구청장기 -> 광산
      /(\w+)공룡배/, // 고성공룡배 -> 고성
      /(\w+)쌀배/, // 이천쌀배 -> 이천
      /(\w+)거북선기/, // 여수거북선기 -> 여수
      /(\w+)한옥마을배/, // 전주한옥마을배 -> 전주
      /(\w+)아리랑배/, // 진도아리랑배 -> 진도
      /(\w+)유달산배/, // 목포유달산배 -> 목포
      /(\w+)풀/, // 완도풀 -> 완도
      /(\w+)체육회장배/, // 청양군체육회장배 -> 청양
    ]

    for (const pattern of locationPatterns) {
      const match = tournamentName.match(pattern)
      if (match) return match[1]
    }

    // Fallback: extract first word that looks like a location
    const words = tournamentName.split(" ")
    for (const word of words) {
      if (word.length >= 2 && !word.includes("회") && !word.includes("배") && !word.includes("2025")) {
        return word
      }
    }

    return tournamentName.slice(0, 4) // Fallback to first 4 characters
  }

  const renderCalendarGrid = (month: any) => {
    const totalCells = 42 // 6 rows × 7 days
    const cells = []

    // Empty cells before month starts
    for (let i = 0; i < month.startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-32 md:h-40 border border-gray-200 bg-gray-50"></div>)
    }

    // Days of the month
    for (let day = 1; day <= month.days; day++) {
      const tournaments = getTournamentsForDate(month.name, day)
      const dayOfWeek = (month.startDay + day - 1) % 7
      const isWeekendDay = isWeekend(dayOfWeek)

      cells.push(
        <div
          key={day}
          className={`h-32 md:h-40 border border-gray-200 p-2 overflow-hidden ${
            isWeekendDay ? "bg-blue-50" : "bg-white"
          }`}
        >
          <div
            className={`text-sm font-bold mb-2 ${
              dayOfWeek === 6 ? "text-red-600" : dayOfWeek === 5 ? "text-blue-600" : "text-gray-700"
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {tournaments.map((tournament, idx) => (
              <div key={idx} className="text-xs">
                <div className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-2 py-1 rounded-md border border-orange-200 mb-1">
                  <div className="font-semibold leading-tight">
                    <span className="md:hidden text-sm">{extractLocationName(tournament.name)}</span>
                    <span className="hidden md:block">{tournament.name}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                    <span className="text-red-700 font-medium">{tournament.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>,
      )
    }

    // Fill remaining cells
    const remainingCells = totalCells - month.startDay - month.days
    for (let i = 0; i < remainingCells; i++) {
      cells.push(<div key={`empty-end-${i}`} className="h-32 md:h-40 border border-gray-200 bg-gray-50"></div>)
    }

    return cells
  }

  const currentMonth = months[currentMonthIndex]

  return (
    <Card className="shadow-xl border-0 mt-6">
      <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white">
        <CardTitle className="text-xl md:text-2xl flex items-center justify-between">
          <span>📅 2025년 전국 배구대회 일정</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonthIndex(Math.max(0, currentMonthIndex - 1))}
              disabled={currentMonthIndex === 0}
              className="text-gray-700 border-gray-300 hover:bg-white hover:text-purple-600 opacity-100"
            >
              <span className="md:hidden">←</span>
              <span className="hidden md:inline">← 이전</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonthIndex(Math.min(months.length - 1, currentMonthIndex + 1))}
              disabled={currentMonthIndex === months.length - 1}
              className="text-gray-700 border-gray-300 hover:bg-white hover:text-purple-600 opacity-100"
            >
              <span className="md:hidden">→</span>
              <span className="hidden md:inline">다음 →</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-lg">
            <h3 className="text-xl font-bold text-center">
              {currentMonth.name} {currentMonth.year}
            </h3>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 bg-gray-50">
            {dayNames.map((day, idx) => (
              <div
                key={day}
                className={`p-3 text-center text-sm font-bold border-r border-gray-200 ${
                  idx === 6 ? "text-red-600" : idx === 5 ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">{renderCalendarGrid(currentMonth)}</div>
        </div>
      </CardContent>
    </Card>
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
  const [tournamentNamesWithDates, setTournamentNamesWithDates] = useState<Array<{ name: string; date: string }>>([])
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
                <img
                  src="/images/main-tiger-mascot.png"
                  alt="랭구랭구 Tiger Head"
                  className="w-32 h-32 md:w-52 md:h-52 object-contain"
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
                    className="bg-white text-green-600 border-white hover:bg-green-50 hover:text-green-700 text-xs md:text-sm px-3 py-2 font-medium shadow-sm"
                  >
                    {showRegionMap ? "권역 숨기기" : "권역 보기"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4">
                <div className="space-y-3">
                  {/* 전체권역 button at top */}
                  <div className="flex justify-start">
                    <Button
                      variant={selectedRegion === "전체권역" ? "default" : "outline"}
                      onClick={() => setSelectedRegion("전체권역")}
                      className={`px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium w-full max-w-lg ${
                        selectedRegion === "전체권역"
                          ? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
                          : "hover:bg-green-50 border-green-300 text-green-700"
                      }`}
                    >
                      전체권역
                    </Button>
                  </div>

                  {/* Other regional tabs in one line */}
                  <div className="flex flex-wrap gap-1 md:gap-3 justify-start">
                    {REGIONS.slice(1).map((region) => (
                      <Button
                        key={region}
                        variant={selectedRegion === region ? "default" : "outline"}
                        onClick={() => setSelectedRegion(region)}
                        className={`text-xs md:text-sm px-2 py-1 md:px-4 md:py-2 h-7 md:h-10 flex-shrink-0 ${
                          selectedRegion === region
                            ? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
                            : "hover:bg-green-50 border-green-300 text-green-700"
                        }`}
                      >
                        {region}
                      </Button>
                    ))}
                  </div>
                </div>

                {showRegionMap && (
                  <div className="mt-4 flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="flex-1 md:max-w-sm">
                      <div className="relative">
                        <img
                          src="/images/korea-regions-map.png"
                          alt="Korea Regions Map"
                          className="w-full max-w-xs mx-auto md:max-w-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                  <div className="text-left md:text-right hidden md:block">
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
                  tournamentNames={tournamentNames}
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
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {(showAllTournamentsList ? tournamentNamesWithDates : tournamentNamesWithDates.slice(0, 3)).map(
                          (tournament, index) => (
                            <div key={index} className="mb-1">
                              {index + 1}. {index === 16 ? "제17회 고흥 우주항공배" : tournament.name}
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

        {selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{selectedTeam.teamName}</h2>
                    <div className="flex flex-wrap space-x-2 md:space-x-4 text-xs md:text-sm">
                      <span>📋 {selectedTeam.division}</span>
                      <span>🗺️ {selectedTeam.region === "기타" ? "수도권" : selectedTeam.region}</span>
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
                    <div className="text-2xl md:text-3xl font-bold text-green-600">
                      {selectedTeam.tournaments.length}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">🏆 입상횟수</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-bold">🏆 입상 기록</h3>

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

        <TournamentCalendar />
      </main>
    </div>
  )
}
