"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, CheckCircle } from "lucide-react"
import { volleyballData, type TournamentResult } from "@/lib/tournament-data-processor"

export function DataUpload() {
  const [rawData, setRawData] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)

  const processData = async () => {
    if (!rawData.trim()) return

    setIsProcessing(true)
    setProcessedCount(0)

    try {
      // 데이터를 줄 단위로 분할하여 처리
      const lines = rawData.trim().split("\n")
      let count = 0

      for (const line of lines) {
        if (line.trim()) {
          // 각 줄을 탭이나 쉼표로 분할
          const parts = line.split(/[\t,]/).map((p) => p.trim())

          if (parts.length >= 3) {
            const result: TournamentResult = {
              tournament: "2025 전국배구대회",
              division: parts[0] || "미분류",
              teamName: parts[2] || "미상",
              rank: parts[1] === "우승" ? 1 : parts[1] === "준우승" ? 2 : 3,
              region: undefined, // 자동으로 추출됨
            }

            volleyballData.addTournamentResult(result)
            count++
          }
        }
      }

      setProcessedCount(count)

      // 페이지 새로고침하여 데이터 반영
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("데이터 처리 중 오류:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-orange-600 text-white">
        <CardTitle className="flex items-center">
          <Upload className="w-6 h-6 mr-2" />🏐 대회 결과 데이터 업로드
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              대회 결과 데이터 (복사해서 붙여넣기)
            </label>
            <Textarea
              placeholder="참가부별    순위    팀명    최우수선수    감독명
남자클럽 2부우승    서울 엄보스윤성현    조영주
남자클럽 2부준우승    용인 토이스토리
남자클럽 2부3위    서울 NWN
..."
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {rawData.trim() ? `${rawData.trim().split("\n").length}줄의 데이터` : "데이터를 입력해주세요"}
            </div>
            <Button
              onClick={processData}
              disabled={!rawData.trim() || isProcessing}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {isProcessing ? (
                <>처리 중... ({processedCount}개 완료)</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  데이터 처리하기
                </>
              )}
            </Button>
          </div>

          {processedCount > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800">{processedCount}개의 대회 결과가 성공적으로 처리되었습니다!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
