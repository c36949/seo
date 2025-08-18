"use client"

import type React from "react"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

interface MedalTooltipProps {
  children: React.ReactNode
  medalType: "wins" | "runner_ups" | "third_places"
  count: number
  teamName: string
}

const TOURNAMENT_NAMES = [
  "전국 배구 선수권 대회",
  "한국 배구 리그",
  "전국 체육대회",
  "대통령배 배구대회",
  "문화체육관광부장관배",
  "KVA컵 배구대회",
  "춘계 전국배구대회",
  "추계 전국배구대회",
  "지역별 배구선수권",
  "클럽 배구 챔피언십",
]

export function MedalTooltip({ children, medalType, count, teamName }: MedalTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (count === 0) {
    return <>{children}</>
  }

  const getMedalInfo = () => {
    switch (medalType) {
      case "wins":
        return {
          icon: <Trophy className="w-4 h-4 text-yellow-500" />,
          title: "우승 기록",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        }
      case "runner_ups":
        return {
          icon: <Medal className="w-4 h-4 text-gray-500" />,
          title: "준우승 기록",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        }
      case "third_places":
        return {
          icon: <Award className="w-4 h-4 text-orange-500" />,
          title: "3위 기록",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        }
    }
  }

  const medalInfo = getMedalInfo()

  // Generate sample tournament records based on count
  const generateTournamentRecords = () => {
    const records = []
    for (let i = 0; i < Math.min(count, 5); i++) {
      const tournament = TOURNAMENT_NAMES[i % TOURNAMENT_NAMES.length]
      const year = 2024 - Math.floor(i / 2)
      records.push(`${year}년 ${tournament}`)
    }
    if (count > 5) {
      records.push(`외 ${count - 5}개 대회`)
    }
    return records
  }

  const tournamentRecords = generateTournamentRecords()

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <div
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onClick={() => setIsOpen(!isOpen)}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className={`max-w-sm p-4 ${medalInfo.bgColor} ${medalInfo.borderColor} border-2`}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {medalInfo.icon}
              <h4 className={`font-semibold ${medalInfo.color}`}>{medalInfo.title}</h4>
              <Badge variant="outline" className="text-xs">
                {count}회
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">{teamName}</p>
              <div className="space-y-1">
                {tournamentRecords.map((record, index) => (
                  <div key={index} className="flex items-center text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                    {record}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
              클릭하면 팀 상세 정보를 볼 수 있습니다
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
