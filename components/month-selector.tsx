"use client"
import { Calendar, ChevronDown } from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function MonthSelector() {
  const { currentMonth, setCurrentMonth } = useStore()

  // Générer les 12 derniers mois
  const generateMonths = () => {
    const months = []
    const now = new Date()

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM
      const monthLabel = date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
      })

      months.push({ key: monthKey, label: monthLabel })
    }

    return months
  }

  const months = generateMonths()
  const currentMonthLabel =
    months.find((m) => m.key === currentMonth)?.label ||
    new Date(currentMonth + "-01").toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
    })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Calendar className="w-4 h-4" />
          <span className="capitalize">{currentMonthLabel}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {months.map((month) => (
          <DropdownMenuItem
            key={month.key}
            onClick={() => setCurrentMonth(month.key)}
            className={`capitalize ${month.key === currentMonth ? "bg-blue-50 text-blue-700" : ""}`}
          >
            {month.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
