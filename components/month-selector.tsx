"use client"
import { Calendar, ChevronDown } from "lucide-react"
import { useStore } from "@/lib/store"

export function MonthSelector() {
  const { currentMonth, setCurrentMonth } = useStore()

  const generateMonthOptions = () => {
    const options = []
    const currentDate = new Date()

    // Générer les 12 derniers mois
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthValue = date.toISOString().slice(0, 7) // YYYY-MM
      const monthLabel = date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
      })
      options.push({ value: monthValue, label: monthLabel })
    }

    return options
  }

  const monthOptions = generateMonthOptions()

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
        <Calendar className="w-4 h-4 text-gray-500" />
        <select
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className="appearance-none bg-transparent border-none outline-none text-sm font-medium text-gray-700 pr-6"
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 pointer-events-none" />
      </div>
    </div>
  )
}
