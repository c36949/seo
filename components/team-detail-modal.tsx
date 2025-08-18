"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trophy, Medal, Award, MapPin, Calendar, Phone, Users, Star } from "lucide-react"
import type { Team, TeamDetails } from "@/lib/volleyball-data"

interface TeamDetailModalProps {
  team: Team | null
  teamDetails: TeamDetails | null
  isOpen: boolean
  onClose: () => void
}

export function TeamDetailModal({ team, teamDetails, isOpen, onClose }: TeamDetailModalProps) {
  if (!team || !teamDetails) return null

  const totalMedals = team.wins + team.runner_ups + team.third_places
  const winRate = totalMedals > 0 ? ((team.wins / totalMedals) * 100).toFixed(1) : "0"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            {team.team_name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Logo and Basic Info */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <img
                  src={teamDetails.logo || "/placeholder.svg"}
                  alt={`${team.team_name} 로고`}
                  className="w-24 h-24 rounded-full border-4 border-blue-200 shadow-lg"
                />
              </div>
              <CardTitle className="text-xl">{team.team_name}</CardTitle>
              <div className="space-y-2">
                <Badge variant="outline" className="text-sm">
                  {team.division}
                </Badge>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {team.region}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{team.ranking_score}</div>
                <div className="text-sm text-gray-500">랭킹 점수</div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">설립년도:</span>
                  <span className="font-medium">{teamDetails.founded}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">위치:</span>
                  <span className="font-medium">{teamDetails.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">승률:</span>
                  <span className="font-medium text-green-600">{winRate}%</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  연락처
                </div>
                <p className="text-sm">{teamDetails.contact}</p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements and Statistics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medal Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  메달 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{team.wins}</div>
                    <div className="flex items-center justify-center text-sm text-yellow-700">
                      <Trophy className="w-4 h-4 mr-1" />
                      우승
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                    <div className="text-3xl font-bold text-gray-600 mb-2">{team.runner_ups}</div>
                    <div className="flex items-center justify-center text-sm text-gray-700">
                      <Medal className="w-4 h-4 mr-1" />
                      준우승
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{team.third_places}</div>
                    <div className="flex items-center justify-center text-sm text-orange-700">
                      <Award className="w-4 h-4 mr-1" />
                      3위
                    </div>
                  </div>
                </div>

                {/* Medal Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>우승률</span>
                      <span>{totalMedals > 0 ? ((team.wins / totalMedals) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: totalMedals > 0 ? `${(team.wins / totalMedals) * 100}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>준우승률</span>
                      <span>{totalMedals > 0 ? ((team.runner_ups / totalMedals) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: totalMedals > 0 ? `${(team.runner_ups / totalMedals) * 100}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>3위율</span>
                      <span>{totalMedals > 0 ? ((team.third_places / totalMedals) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: totalMedals > 0 ? `${(team.third_places / totalMedals) * 100}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievement History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-blue-500" />
                  주요 성과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamDetails.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{achievement}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        2024
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-500" />팀 소개
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{teamDetails.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
