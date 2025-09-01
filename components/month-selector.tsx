"use client"

import { Calendar } from "lucide-react"
import { useStore } from "@/lib/store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MonthSelector() {
  const { selectedMonth, setSelectedMonth, getAvailableMonths } = useStore()

  const availableMonths = getAvailableMonths()
  const currentMonth = new Date().toISOString().slice(0, 7)

  // Ajouter le mois actuel s'il n'existe pas
  const allMonths = [...new Set([currentMonth, ...availableMonths])].sort().reverse()

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
  }

  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
      <Calendar className="h-4 w-4 text-blue-600" />
      <span className="text-sm font-medium text-gray-700">Mois :</span>
      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
        <SelectTrigger className="w-48 border-0 shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allMonths.map((month) => (
            <SelectItem key={month} value={month}>
              {formatMonth(month)}
              {month === currentMonth && " (actuel)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
