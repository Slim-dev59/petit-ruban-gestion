"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Sale {
  id?: string
  date: string
  description: string
  prix: string
  paiement: string
  createur: string
  quantity?: string
  sku?: string
  statut?: "active" | "payee"
  paymentId?: string
  commission?: string
}

interface StockItem {
  createur: string
  article: string
  price: string
  quantity: string
  category: string
  sku: string
  lowStockThreshold: string
  image?: string
}

interface Payment {
  id: string
  createur: string
  montant: number
  dateVirement: string
  reference: string
  banque: string
  notes?: string
  creePar: string
  dateCreation: string
  ventesPayees: Sale[]
}

interface Participation {
  id: string
  createur: string
  mois: string
  montantLoyer: number
  dateEcheance: string
  statut: "en_attente" | "paye" | "en_retard"
  datePaiement?: string
  modePaiement?: string
  reference?: string
  notes?: string
  dateCreation: string
}

interface PendingSale {
  id: string
  date: string
  description: string
  prix: string
  paiement: string
  quantity?: string
  commission?: string
  month: string
  suggestedCreator?: string
  confidence?: number
  matchedItem?: string
  needsValidation: boolean
}

interface ImportHistory {
  id: string
  fileName: string
  importDate: string
  salesCount: number
  assignedCount: number
  unassignedCount: string
  months: string[]
}

interface Settings {
  commissionRate: number
  shopName: string
  shopSubtitle: string
  logoUrl: string
  autoApplyCommission: boolean
  loyerMensuel: number
}

interface MonthlyData {
  salesData: Sale[]
  payments: Payment[]
  participations: Participation[]
  pendingSales: PendingSale[]
}

interface Store {
  creators: string[]
  stockData: StockItem[]
  monthlyData: Record<string, MonthlyData>
  currentMonth: string
  settings: Settings
  importHistory: ImportHistory[]

  setCurrentMonth: (month: string) => void
  getCurrentMonthData: () => MonthlyData
  addCreator: (name: string) => void
  removeCreator: (name: string) => void
  removeAllCreators: () => void
  importSalesData: (data: Sale[], month?: string) => void
  importStockData: (data: any[]) => void
  getSalesForCreator: (creator: string, month?: string) => Sale[]
  getStockForCreator: (creator: string) => StockItem[]
  updateSettings: (settings: Settings) => void
  updateCreatorMapping: (mapping: Record<string, string>) => void
  resetAllData: () => void
  clearStockData: () => void
  clearSalesData: (month?: string) => void
  updateSale: (saleId: string, updates: Partial<Sale>, month?: string) => void
  getSaleById: (saleId: string, month?: string) => Sale | undefined
  addPendingSales: (sales: PendingSale[], month?: string) => void
  getPendingSales: (month?: string) => PendingSale[]
  updatePendingSale: (saleId: string, updates: Partial<PendingSale>, month?: string) => void
  removePendingSale: (saleId: string, month?: string) => void
  clearPendingSales: (month?: string) => void
  getTotalPendingSales: () => number
  addImportHistory: (importData: Omit<ImportHistory, "id" | "importDate">) => void
  getImportHistory: () => ImportHistory[]
  removeImportHistory: (importId: string) => void
  addPayment: (payment: Omit<Payment, "id" | "dateCreation">, month?: string) => void
  getPaymentsForCreator: (creator: string, month?: string) => Payment[]
  getAllPayments: () => Payment[]
  updatePayment: (paymentId: string, updates: Partial<Payment>) => void
  deletePayment: (paymentId: string) => void
  payCreatorAndReset: (
    creator: string,
    paymentData: Omit<Payment, "id" | "dateCreation" | "createur" | "ventesPayees">,
    month?: string,
  ) => void
  getAllSalesForCreator: (creator: string, month?: string) => Sale[]
  getPaidSalesForCreator: (creator: string, month?: string) => Sale[]
  addParticipation: (participation: Omit<Participation, "id" | "dateCreation">) => void
  updateParticipation: (participationId: string, updates: Partial<Participation>) => void
  deleteParticipation: (participationId: string) => void
  getParticipationsForCreator: (creator: string, month?: string) => Participation[]
  getAllParticipations: () => Participation[]
  generateMonthlyParticipations: (month: string) => void
  salesData: Sale[]
  payments: Payment[]
}

const getDefaultMonthlyData = (): MonthlyData => ({
  salesData: [],
  payments: [],
  participations: [],
  pendingSales: [],
})

const getDefaultSettings = (): Settings => ({
  commissionRate: 1.75,
  shopName: "Ma Boutique Multi-Créateurs",
  shopSubtitle: "Gestion des ventes et créateurs",
  logoUrl: "",
  autoApplyCommission: true,
  loyerMensuel: 50,
})

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      creators: [],
      stockData: [],
      monthlyData: {},
      currentMonth: new Date().toISOString().slice(0, 7),
      importHistory: [],
      settings: getDefaultSettings(),

      get salesData() {
        const { monthlyData, currentMonth } = get()
        return monthlyData[currentMonth]?.salesData || []
      },

      get payments() {
        const { monthlyData, currentMonth } = get()
        return monthlyData[currentMonth]?.payments || []
      },

      setCurrentMonth: (month: string) => {
        set({ currentMonth: month })
      },

      getCurrentMonthData: () => {
        const { monthlyData, currentMonth } = get()
        return monthlyData[currentMonth] || getDefaultMonthlyData()
      },

      addCreator: (name) => {
        if (!name || typeof name !== "string") return
        set((state) => ({
          creators: [...state.creators.filter((c) => c !== name), name],
        }))
      },

      removeCreator: (name) => {
        set((state) => ({
          creators: state.creators.filter((c) => c !== name),
        }))
      },

      removeAllCreators: () => {
        set({ creators: [] })
      },

      importSalesData: (data: Sale[], month?: string) => {
        const targetMonth = month || get().currentMonth
        const salesWithStatus = data.map((sale, index) => ({
          ...sale,
          id: sale.id || `sale_${Date.now()}_${index}`,
          date: sale.date || new Date().toISOString().split("T")[0],
          description: sale.description || "",
          prix: sale.prix || "0",
          paiement: sale.paiement || "",
          createur: sale.createur || "",
          statut: "active" as const,
        }))

        set((state) => {
          const currentData = state.monthlyData[targetMonth] || getDefaultMonthlyData()
          return {
            monthlyData: {
              ...state.monthlyData,
              [targetMonth]: {
                ...currentData,
                salesData: [...currentData.salesData, ...salesWithStatus],
              },
            },
          }
        })
      },

      importStockData: (data) => {
        const processedData: StockItem[] = data.map((item: any) => ({
          createur: item.createur || "",
          article: item.article || "",
          price: item.price || "0",
          quantity: item.quantity || "0",
          category: item.category || "",
          sku: item.sku || "",
          lowStockThreshold: item.lowStockThreshold || "0",
          image: item.image || "",
        }))

        const creatorsFound = [...new Set(processedData.map((item) => item.createur).filter(Boolean))]
        creatorsFound.forEach((creator) => {
          if (creator && !get().creators.includes(creator)) {
            get().addCreator(creator)
          }
        })

        set({ stockData: processedData })
      },

      getSalesForCreator: (creator, month) => {
        const targetMonth = month || get().currentMonth
        const monthData = get().monthlyData[targetMonth]
        if (!monthData) return []
        return monthData.salesData.filter((sale) => sale.createur === creator && sale.statut !== "payee")
      },

      getStockForCreator: (creator) => {
        return get().stockData.filter((item) => item.createur === creator)
      },

      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }))
      },

      updateCreatorMapping: (mapping) => {
        set((state) => {
          const updatedStockData = state.stockData.map((item) => ({
            ...item,
            createur: mapping[item.createur] || item.createur,
          }))
          return { stockData: updatedStockData }
        })
      },

      resetAllData: () => {
        set({
          creators: [],
          stockData: [],
          monthlyData: {},
          importHistory: [],
          settings: getDefaultSettings(),
        })
      },

      clearStockData: () => {
        set({ stockData: [] })
      },

      clearSalesData: (month) => {
        const targetMonth = month || get().currentMonth
        set((state) => {
          const currentData = state.monthlyData[targetMonth] || getDefaultMonthlyData()
          return {
            monthlyData: {
              ...state.monthlyData,
              [targetMonth]: {
                ...currentData,
                salesData: [],
              },
            },
          }
        })
      },

      updateSale: (saleId: string, updates: Partial<Sale>, month?: string) => {
        const targetMonth = month || get().currentMonth
        set((state) => {
          const currentData = state.monthlyData[targetMonth] || getDefaultMonthlyData()
          return {
            monthlyData: {
              ...state.monthlyData,
              [targetMonth]: {
                ...currentData,
                salesData: currentData.salesData.map((sale) => (sale.id === saleId ? { ...sale, ...updates } : sale)),
              },
            },
          }
        })
      },

      getSaleById: (saleId: string, month?: string) => {
        const targetMonth = month || get().currentMonth
        const monthData = get().monthlyData[targetMonth]
        if (!monthData) return undefined
        return monthData.salesData.find((sale) => sale.id === saleId)
      },

      addPendingSales: (sales: PendingSale[], month?: string) => {
        const targetMonth = month || get().currentMonth
        set((state) => {
          const currentData = state.monthlyData[targetMonth] || getDefaultMonthlyData()
          return {
            monthlyData: {
              ...state.monthlyData,
              [targetMonth]: {
                ...currentData,
                pendingSales: [...currentData.pendingSales, ...sales],
              },
            },
          }
        })
      },

      getPendingSales: (month?: string) => {
        const targetMonth = month || get().currentMonth
        const monthData = get().monthlyData[targetMonth]
        return monthData ? monthData.pendingSales : []
      },

      updatePendingSale: (saleId: string, updates: Partial<PendingSale>, month?: string) => {
        const targetMonth = month || get().currentMonth
        set((state) => {
          const currentData = state.monthlyData[targetMonth] || getDefaultMonthlyData()
          return {
            monthlyData: {
              ...state.monthlyData,
              [targetMonth]: {
                ...currentData,
                pendingSales: currentData.pendingSales.map((sale) =>
                  sale.id === saleId ? { ...sale, ...updates } : sale,
                ),
              },
            },
          }
        })
      },

      removePendingSale: (saleId: string, month?: string) => {
        const targetMonth = month || get().currentMonth
        set((state) => {
          const currentData = state.monthlyData[targetMonth] || getDefaultMonthlyData()
          return {
            monthlyData: {
              ...state.monthlyData,
              [targetMonth]: {
                ...currentData,
                pendingSales: currentData.pendingSales.filter((sale) => sale.id !== saleId),
              },
            },
          }
        })
      },

      clearPendingSales: (month?: string) => {
        const targetMonth = month || get().currentMonth
        set((state) => {
          const currentData = state.monthlyData[targetMonth] || getDefaultMonthlyData()
          return {
            monthlyData: {
              ...state.monthlyData,
              [targetMonth]: {
                ...currentData,
                pendingSales: [],
              },
            },
          }
        })
      },

      getTotalPendingSales: () => {
        return Object.values(get().monthlyData).reduce((total, monthData) => {
          return total + monthData.pendingSales.filter((sale) => sale.needsValidation).length
        }, 0)
      },

      addImportHistory: (importData) => {
        const newImport: ImportHistory = {
          ...importData,
          id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          importDate: new Date().toISOString(),
        }

        set((state) => ({
          importHistory: [newImport, ...state.importHistory],
        }))
      },

      getImportHistory: () => {
        return get().importHistory
      },

      removeImportHistory: (importId: string) => {
        set((state) => ({
          importHistory: state.importHistory.filter((imp) => imp.id !== importId),
        }))
      },

      addPayment: (paymentData, month) => {
        const targetMonth = month || get().currentMonth
        const payment: Payment = {
          ...paymentData,
          id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dateCreation: new Date().toISOString(),
        }

        set((state) => {
          const currentData = state.monthlyData[targetMonth] || getDefaultMonthlyData()
          return {
            monthlyData: {
              ...state.monthlyData,
              [targetMonth]: {
                ...currentData,
                payments: [...currentData.payments, payment],
              },
            },
          }
        })
      },

      getPaymentsForCreator: (creator: string, month) => {
        const targetMonth = month || get().currentMonth
        const monthData = get().monthlyData[targetMonth]
        if (!monthData) return []
        return monthData.payments.filter((payment) => payment.createur === creator)
      },

      getAllPayments: () => {
        return Object.values(get().monthlyData).flatMap((month) => month.payments)
      },

      updatePayment: (paymentId: string, updates: Partial<Payment>) => {
        set((state) => {
          const updatedMonthlyData = { ...state.monthlyData }

          for (const month in updatedMonthlyData) {
            const monthData = updatedMonthlyData[month]
            const paymentIndex = monthData.payments.findIndex((p) => p.id === paymentId)

            if (paymentIndex !== -1) {
              updatedMonthlyData[month] = {
                ...monthData,
                payments: monthData.payments.map((payment) =>
                  payment.id === paymentId ? { ...payment, ...updates } : payment,
                ),
              }
              break
            }
          }

          return { monthlyData: updatedMonthlyData }
        })
      },

      deletePayment: (paymentId: string) => {
        set((state) => {
          const updatedMonthlyData = { ...state.monthlyData }

          for (const month in updatedMonthlyData) {
            const monthData = updatedMonthlyData[month]
            const paymentIndex = monthData.payments.findIndex((p) => p.id === paymentId)

            if (paymentIndex !== -1) {
              const payment = monthData.payments[paymentIndex]
              updatedMonthlyData[month] = {
                ...monthData,
                payments: monthData.payments.filter((p) => p.id !== paymentId),
                salesData: monthData.salesData.map((sale) =>
                  sale.paymentId === paymentId ? { ...sale, statut: "active" as const, paymentId: undefined } : sale,
                ),
              }
              break
            }
          }

          return { monthlyData: updatedMonthlyData }
        })
      },

      payCreatorAndReset: (creator: string, paymentData, month) => {
        const targetMonth = month || get().currentMonth
        const state = get()
        const monthData = state.monthlyData[targetMonth] || getDefaultMonthlyData()
        const creatorSales = monthData.salesData.filter((sale) => sale.createur === creator && sale.statut !== "payee")

        const totalSales = creatorSales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)
        const totalCommission = creatorSales.reduce((sum, sale) => {
          const price = Number.parseFloat(sale.prix || "0")
          const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
          return sum + (isNotCash ? price * (state.settings.commissionRate / 100) : 0)
        }, 0)
        const netAmount = totalSales - totalCommission

        const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const payment: Payment = {
          id: paymentId,
          createur: creator,
          montant: netAmount,
          dateVirement: paymentData.dateVirement,
          reference: paymentData.reference,
          banque: paymentData.banque,
          notes: paymentData.notes,
          creePar: paymentData.creePar,
          dateCreation: new Date().toISOString(),
          ventesPayees: [...creatorSales],
        }

        set((state) => {
          const currentData = state.monthlyData[targetMonth] || getDefaultMonthlyData()
          return {
            monthlyData: {
              ...state.monthlyData,
              [targetMonth]: {
                ...currentData,
                salesData: currentData.salesData.map((sale) =>
                  sale.createur === creator && sale.statut !== "payee"
                    ? { ...sale, statut: "payee" as const, paymentId: paymentId }
                    : sale,
                ),
                payments: [...currentData.payments, payment],
              },
            },
          }
        })
      },

      getAllSalesForCreator: (creator, month) => {
        const targetMonth = month || get().currentMonth
        const monthData = get().monthlyData[targetMonth]
        if (!monthData) return []
        return monthData.salesData.filter((sale) => sale.createur === creator)
      },

      getPaidSalesForCreator: (creator, month) => {
        const targetMonth = month || get().currentMonth
        const monthData = get().monthlyData[targetMonth]
        if (!monthData) return []
        return monthData.salesData.filter((sale) => sale.createur === creator && sale.statut === "payee")
      },

      addParticipation: (participationData) => {
        const participation: Participation = {
          ...participationData,
          id: `participation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dateCreation: new Date().toISOString(),
        }

        const targetMonth = participationData.mois
        set((state) => {
          const currentData = state.monthlyData[targetMonth] || getDefaultMonthlyData()
          return {
            monthlyData: {
              ...state.monthlyData,
              [targetMonth]: {
                ...currentData,
                participations: [...currentData.participations, participation],
              },
            },
          }
        })
      },

      updateParticipation: (participationId: string, updates: Partial<Participation>) => {
        set((state) => {
          const updatedMonthlyData = { ...state.monthlyData }

          for (const month in updatedMonthlyData) {
            const monthData = updatedMonthlyData[month]
            const participationIndex = monthData.participations.findIndex((p) => p.id === participationId)

            if (participationIndex !== -1) {
              updatedMonthlyData[month] = {
                ...monthData,
                participations: monthData.participations.map((participation) =>
                  participation.id === participationId ? { ...participation, ...updates } : participation,
                ),
              }
              break
            }
          }

          return { monthlyData: updatedMonthlyData }
        })
      },

      deleteParticipation: (participationId: string) => {
        set((state) => {
          const updatedMonthlyData = { ...state.monthlyData }

          for (const month in updatedMonthlyData) {
            const monthData = updatedMonthlyData[month]
            const participationIndex = monthData.participations.findIndex((p) => p.id === participationId)

            if (participationIndex !== -1) {
              updatedMonthlyData[month] = {
                ...monthData,
                participations: monthData.participations.filter((p) => p.id !== participationId),
              }
              break
            }
          }

          return { monthlyData: updatedMonthlyData }
        })
      },

      getParticipationsForCreator: (creator: string, month) => {
        const targetMonth = month || get().currentMonth
        const monthData = get().monthlyData[targetMonth]
        if (!monthData) return []
        return monthData.participations.filter((participation) => participation.createur === creator)
      },

      getAllParticipations: () => {
        return Object.values(get().monthlyData).flatMap((month) => month.participations)
      },

      generateMonthlyParticipations: (month: string) => {
        const { creators, settings } = get()
        const monthData = get().monthlyData[month] || getDefaultMonthlyData()
        const existingParticipations = monthData.participations

        creators.forEach((creator) => {
          const hasParticipation = existingParticipations.some((p) => p.createur === creator)

          if (!hasParticipation) {
            const lastDayOfMonth = new Date(month + "-01")
            lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1)
            lastDayOfMonth.setDate(0)

            get().addParticipation({
              createur: creator,
              mois: month,
              montantLoyer: settings.loyerMensuel,
              dateEcheance: lastDayOfMonth.toISOString().split("T")[0],
              statut: "en_attente",
            })
          }
        })
      },
    }),
    {
      name: "boutique-storage",
    },
  ),
)
