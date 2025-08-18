"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Trophy, Medal, Award, ArrowLeft } from "lucide-react"
import { type Team, type VolleyballDatabase, dataManager } from "@/lib/volleyball-data"

interface RegionalMapProps {
  data: VolleyballDatabase
  onRegionSelect: (region: string) => void
}

interface RegionInfo {
  name: string
  color: string
  hoverColor: string
  position: { x: number; y: number }
  description: string
}

const REGIONS: Record<string, RegionInfo> = {
  수도권: {
    name: "수도권",
    color: "#3B82F6",
    hoverColor: "#1D4ED8",
    position: { x: 50, y: 25 },
    description: "서울, 인천, 경기도",
  },
  강원권: {
    name: "강원권",
    color: "#10B981",
    hoverColor: "#047857",
    position: { x: 75, y: 20 },
    description: "강원도",
  },
  충청권: {
    name: "충청권",
    color: "#F59E0B",
    hoverColor: "#D97706",
    position: { x: 45, y: 45 },
    description: "대전, 세종, 충남, 충북",
  },
  전라권: {
    name: "전라권",
    color: "#EF4444",
    hoverColor: "#DC2626",
    position: { x: 35, y: 65 },
    description: "광주, 전남, 전북",
  },
  경상권: {
    name: "경상권",
    color: "#8B5CF6",
    hoverColor: "#7C3AED",
    position: { x: 70, y: 60 },
    description: "부산, 대구, 울산, 경남, 경북",
  },
  제주권: {
    name: "제주권",
    color: "#06B6D4",
    hoverColor: "#0891B2",
    position: { x: 25, y: 85 },
    description: "제주도",
  },
}

export function RegionalMap({ data, onRegionSelect }: RegionalMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  const handleRegionClick = (regionName: string) => {
    setSelectedRegion(regionName)
    onRegionSelect(regionName)
  }

  const getRegionTeams = (regionName: string): Team[] => {
    return dataManager.getTeamsByRegion(data.teams, regionName)
  }

  const getRegionStats = (regionName: string) => {
    return dataManager.getRegionStats(data.teams, regionName)
  }

  return (
    <div className="space-y-6">
      {/* Interactive Map */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardTitle className="text-xl flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            대한민국 권역별 배구클럽 분포
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8">
            {/* SVG Map */}
            <svg viewBox="0 0 400 300" className="w-full max-w-2xl mx-auto h-auto" style={{ minHeight: "300px" }}>
              {/* Background */}
              <rect width="400" height="300" fill="url(#mapGradient)" rx="10" />

              {/* Gradient Definition */}
              <defs>
                <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F0F9FF" />
                  <stop offset="100%" stopColor="#E0F2FE" />
                </linearGradient>
              </defs>

              {/* Region Shapes (Simplified) */}
              {Object.entries(REGIONS).map(([key, region]) => {
                const stats = getRegionStats(key)
                const isHovered = hoveredRegion === key
                const isSelected = selectedRegion === key

                return (
                  <g key={key}>
                    {/* Region Circle */}
                    <circle
                      cx={region.position.x * 4}
                      cy={region.position.y * 3}
                      r={Math.max(20, Math.sqrt(stats.totalTeams) * 3)}
                      fill={isHovered || isSelected ? region.hoverColor : region.color}
                      stroke="white"
                      strokeWidth="3"
                      className="cursor-pointer transition-all duration-200 hover:stroke-4"
                      onMouseEnter={() => setHoveredRegion(key)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={() => handleRegionClick(key)}
                      style={{
                        filter: isHovered ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" : "none",
                        transform: isHovered ? "scale(1.1)" : "scale(1)",
                        transformOrigin: `${region.position.x * 4}px ${region.position.y * 3}px`,
                      }}
                    />

                    {/* Region Label */}
                    <text
                      x={region.position.x * 4}
                      y={region.position.y * 3 + 5}
                      textAnchor="middle"
                      className="fill-white font-bold text-sm pointer-events-none"
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                    >
                      {region.name}
                    </text>

                    {/* Team Count */}
                    <text
                      x={region.position.x * 4}
                      y={region.position.y * 3 - 8}
                      textAnchor="middle"
                      className="fill-white font-semibold text-xs pointer-events-none"
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                    >
                      {stats.totalTeams}팀
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Hover Info */}
            {hoveredRegion && (
              <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-200">
                <h4 className="font-bold text-lg text-gray-800">{REGIONS[hoveredRegion].name}</h4>
                <p className="text-sm text-gray-600 mb-2">{REGIONS[hoveredRegion].description}</p>
                {(() => {
                  const stats = getRegionStats(hoveredRegion)
                  return (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>총 팀수:</span>
                        <span className="font-semibold">{stats.totalTeams}개</span>
                      </div>
                      <div className="flex justify-between">
                        <span>총 우승:</span>
                        <span className="font-semibold text-yellow-600">{stats.totalWins}회</span>
                      </div>
                      <div className="flex justify-between">
                        <span>총 메달:</span>
                        <span className="font-semibold text-blue-600">{stats.totalMedals}개</span>
                      </div>
                      {stats.topTeam && (
                        <div className="pt-2 border-t">
                          <span className="text-xs text-gray-500">1위 팀:</span>
                          <div className="font-semibold text-blue-600">{stats.topTeam.team_name}</div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Region Statistics Grid */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(REGIONS).map(([key, region]) => {
              const stats = getRegionStats(key)
              const isSelected = selectedRegion === key

              return (
                <Button
                  key={key}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-20 flex flex-col items-center justify-center transition-all ${
                    isSelected ? "bg-blue-600 text-white" : "hover:bg-blue-50 bg-white border-2 hover:border-blue-300"
                  }`}
                  onClick={() => handleRegionClick(key)}
                  style={{
                    borderColor: isSelected ? region.color : undefined,
                  }}
                >
                  <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: region.color }} />
                  <span className="font-semibold text-sm">{region.name}</span>
                  <span className="text-xs opacity-75">
                    {stats.totalTeams}팀 · {stats.totalWins}승
                  </span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Region Details */}
      {selectedRegion && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-xl flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: REGIONS[selectedRegion].color }} />
                {selectedRegion} 지역 랭킹
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRegion(null)}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                돌아가기
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">순위</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">팀명</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">부</th>
                    <th className="px-4 py-3 text-center font-semibold text-yellow-600">🥇</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-400">🥈</th>
                    <th className="px-4 py-3 text-center font-semibold text-orange-600">🥉</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">총계</th>
                  </tr>
                </thead>
                <tbody>
                  {getRegionTeams(selectedRegion).map((team, index) => (
                    <tr
                      key={team.id}
                      className={`border-b hover:bg-blue-50 transition-colors ${
                        index < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
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
                              {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                              {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                              {index === 2 && <Award className="w-4 h-4 text-orange-500" />}
                            </div>
                          )}
                          {index < 3 && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs"
                              style={{
                                borderColor: REGIONS[selectedRegion].color,
                                color: REGIONS[selectedRegion].color,
                              }}
                            >
                              {selectedRegion} {index + 1}위
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-left hover:text-blue-600 font-medium transition-colors">
                          {team.team_name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{team.division}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-semibold">
                          {team.wins}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-semibold">
                          {team.runner_ups}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-semibold">
                          {team.third_places}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                          {team.total_medals}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
