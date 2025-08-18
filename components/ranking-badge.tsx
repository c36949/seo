"use client"
import { Medal, Award, Crown, Star } from "lucide-react"
import type { Team } from "@/lib/volleyball-data"

interface RankingBadgeProps {
  team: Team
  regionalRank: number
  divisionRank?: number
  showRegionalBadge?: boolean
  showDivisionBadge?: boolean
  size?: "sm" | "md" | "lg"
}

const REGION_COLORS = {
  수도권: { primary: "#3B82F6", secondary: "#DBEAFE", text: "#1E40AF" },
  경상권: { primary: "#8B5CF6", secondary: "#EDE9FE", text: "#6D28D9" },
  전라권: { primary: "#EF4444", secondary: "#FEE2E2", text: "#DC2626" },
  충청권: { primary: "#F59E0B", secondary: "#FEF3C7", text: "#D97706" },
  강원권: { primary: "#10B981", secondary: "#D1FAE5", text: "#047857" },
  제주권: { primary: "#06B6D4", secondary: "#CFFAFE", text: "#0891B2" },
}

const DIVISION_COLORS = {
  남자클럽3부: { primary: "#1F2937", secondary: "#F3F4F6", text: "#111827" },
  여자클럽3부: { primary: "#EC4899", secondary: "#FCE7F3", text: "#BE185D" },
  남자장년부: { primary: "#7C3AED", secondary: "#EDE9FE", text: "#5B21B6" },
  여자장년부: { primary: "#F97316", secondary: "#FED7AA", text: "#EA580C" },
  남자시니어부: { primary: "#059669", secondary: "#D1FAE5", text: "#047857" },
  남자실버부: { primary: "#6B7280", secondary: "#F9FAFB", text: "#374151" },
  남자대학부: { primary: "#DC2626", secondary: "#FEE2E2", text: "#B91C1C" },
  여자대학부: { primary: "#7C2D12", secondary: "#FEF2F2", text: "#991B1B" },
  남자국제부: { primary: "#1E40AF", secondary: "#DBEAFE", text: "#1D4ED8" },
  여자국제부: { primary: "#BE123C", secondary: "#FFE4E6", text: "#9F1239" },
}

export function RankingBadge({
  team,
  regionalRank,
  divisionRank,
  showRegionalBadge = true,
  showDivisionBadge = false,
  size = "sm",
}: RankingBadgeProps) {
  const regionColor = REGION_COLORS[team.region as keyof typeof REGION_COLORS] || REGION_COLORS.수도권
  const divisionColor = DIVISION_COLORS[team.division as keyof typeof DIVISION_COLORS] || DIVISION_COLORS.남자클럽3부

  const getBadgeIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-3 h-3 mr-1" />
      case 2:
        return <Medal className="w-3 h-3 mr-1" />
      case 3:
        return <Award className="w-3 h-3 mr-1" />
      default:
        return <Star className="w-3 h-3 mr-1" />
    }
  }

  const getBadgeStyle = (rank: number, colors: any) => {
    const baseStyle = {
      backgroundColor: colors.secondary,
      color: colors.text,
      borderColor: colors.primary,
    }

    if (rank === 1) {
      return {
        ...baseStyle,
        backgroundColor: colors.primary,
        color: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }
    }

    return baseStyle
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  }

  return (
    <div className="flex items-center space-x-1">
      {/* Regional Badge */}
      {showRegionalBadge && regionalRank <= 3 && (
        <div
          className={`inline-flex items-center rounded-full border font-semibold transition-all hover:scale-105 ${sizeClasses[size]}`}
          style={getBadgeStyle(regionalRank, regionColor)}
        >
          {getBadgeIcon(regionalRank)}
          <span>
            {team.region} {regionalRank}위
          </span>
        </div>
      )}

      {/* Division Badge */}
      {showDivisionBadge && divisionRank && divisionRank <= 5 && (
        <div
          className={`inline-flex items-center rounded-full border font-semibold transition-all hover:scale-105 ${sizeClasses[size]}`}
          style={getBadgeStyle(divisionRank, divisionColor)}
        >
          {getBadgeIcon(divisionRank)}
          <span>
            {team.division} {divisionRank}위
          </span>
        </div>
      )}
    </div>
  )
}

interface ChampionBadgeProps {
  team: Team
  type: "regional" | "division" | "overall"
  rank: number
  size?: "sm" | "md" | "lg"
}

export function ChampionBadge({ team, type, rank, size = "md" }: ChampionBadgeProps) {
  if (rank > 3) return null

  const getChampionStyle = () => {
    switch (rank) {
      case 1:
        return {
          gradient: "from-yellow-400 via-yellow-500 to-yellow-600",
          shadow: "shadow-yellow-500/25",
          glow: "drop-shadow-lg",
          text: "text-white",
          icon: <Crown className="w-4 h-4" />,
        }
      case 2:
        return {
          gradient: "from-gray-300 via-gray-400 to-gray-500",
          shadow: "shadow-gray-500/25",
          glow: "drop-shadow-md",
          text: "text-white",
          icon: <Medal className="w-4 h-4" />,
        }
      case 3:
        return {
          gradient: "from-orange-400 via-orange-500 to-orange-600",
          shadow: "shadow-orange-500/25",
          glow: "drop-shadow-md",
          text: "text-white",
          icon: <Award className="w-4 h-4" />,
        }
      default:
        return null
    }
  }

  const style = getChampionStyle()
  if (!style) return null

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  }

  const getTypeLabel = () => {
    switch (type) {
      case "regional":
        return `${team.region} 챔피언`
      case "division":
        return `${team.division} 챔피언`
      case "overall":
        return "전국 챔피언"
    }
  }

  return (
    <div
      className={`inline-flex items-center space-x-1 rounded-full bg-gradient-to-r ${style.gradient} ${style.shadow} ${style.text} font-bold ${sizeClasses[size]} animate-pulse`}
      style={{ filter: style.glow }}
    >
      {style.icon}
      <span>{getTypeLabel()}</span>
    </div>
  )
}

interface BadgeCollectionProps {
  team: Team
  regionalRank: number
  divisionRank?: number
  overallRank?: number
  compact?: boolean
}

export function BadgeCollection({
  team,
  regionalRank,
  divisionRank,
  overallRank,
  compact = false,
}: BadgeCollectionProps) {
  return (
    <div className={`flex items-center ${compact ? "space-x-1" : "space-x-2"} flex-wrap`}>
      {/* Champion Badges for Top Performers */}
      {overallRank === 1 && <ChampionBadge team={team} type="overall" rank={1} size={compact ? "sm" : "md"} />}
      {divisionRank === 1 && overallRank !== 1 && (
        <ChampionBadge team={team} type="division" rank={1} size={compact ? "sm" : "md"} />
      )}
      {regionalRank === 1 && divisionRank !== 1 && overallRank !== 1 && (
        <ChampionBadge team={team} type="regional" rank={1} size={compact ? "sm" : "md"} />
      )}

      {/* Regular Ranking Badges */}
      <RankingBadge
        team={team}
        regionalRank={regionalRank}
        divisionRank={divisionRank}
        showRegionalBadge={regionalRank <= 3 && regionalRank !== 1}
        showDivisionBadge={divisionRank ? divisionRank <= 5 && divisionRank !== 1 : false}
        size={compact ? "sm" : "md"}
      />
    </div>
  )
}
