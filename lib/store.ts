import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Creator {
  id: string
  name: string
  commission: number
  isActive: boolean
  email?: string
  phone?: string
  address?: string
  iban?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface StockItem {
  id: string
  creatorId: string
  reference: string
  description: string
  price: number
  quantity: number
  soldQuantity: number
  status: "available" | "sold" | "reserved"
  addedDate: string
  soldDate?: string
  notes?: string
}

export interface Sale {
  id: string
  creatorId: string | null
  creatorName?: string
  reference: string
  description: string
  montant: number
  date: string
  validated: boolean
  matched?: boolean
  confidence?: number
  stockItemId?: string
  notes?: string
}

export interface MonthData {
  salesData: Sale[]
  participations: Participation[]
}

export interface Payment {
  id: string
  creatorId: string
  creatorName: string
  amount: number
  date: string
  period: string
  method: "bank_transfer" | "cash" | "check" | "other"
  reference?: string
  notes?: string
  status: "pending" | "completed" | "cancelled"
  createdAt: string
}

export interface Participation {
  id: string
  creatorId: string
  creatorName: string
  amount: number
  month: string
  status: "pending" | "paid"
  paidDate?: string
  notes?: string
  createdAt: string
}

export interface Settings {
  shopName: string
  shopSubtitle: string
  address: string
  email: string
  phone: string
  siret: string
  logoUrl?: string
  defaultCommission: number
  participationAmount: number
  currency: string
}

interface BoutiqueState {
  creators: Creator[]
  stockData: StockItem[]
  monthlyData: Record<string, MonthData>
  payments: Payment[]
  settings: Settings

  // Creator actions
  addCreator: (creator: Omit<Creator, "id" | "createdAt" | "updatedAt">) => void
  updateCreator: (id: string, updates: Partial<Creator>) => void
  deleteCreator: (id: string) => void

  // Stock actions
  addStockItem: (item: Omit<StockItem, "id" | "soldQuantity" | "status" | "addedDate">) => void
  updateStockItem: (id: string, updates: Partial<StockItem>) => void
  deleteStockItem: (id: string) => void
  markAsSold: (id: string) => void

  // Sales actions
  addSale: (monthYear: string, sale: Omit<Sale, "id">) => void
  updateSale: (monthYear: string, saleId: string, updates: Partial<Sale>) => void
  deleteSale: (monthYear: string, saleId: string) => void
  importSales: (monthYear: string, sales: Omit<Sale, "id">[]) => void

  // Payment actions
  addPayment: (payment: Omit<Payment, "id" | "createdAt">) => void
  updatePayment: (id: string, updates: Partial<Payment>) => void
  deletePayment: (id: string) => void

  // Participation actions
  addParticipation: (monthYear: string, participation: Omit<Participation, "id" | "createdAt">) => void
  updateParticipation: (monthYear: string, participationId: string, updates: Partial<Participation>) => void
  deleteParticipation: (monthYear: string, participationId: string) => void
  markParticipationPaid: (monthYear: string, participationId: string) => void

  // Settings actions
  updateSettings: (updates: Partial<Settings>) => void

  // Utility functions
  getCreatorById: (id: string) => Creator | undefined
  getStockByCreator: (creatorId: string) => StockItem[]
  getSalesByCreator: (monthYear: string, creatorId: string) => Sale[]
  getTotalSales: (monthYear: string) => number
  getTotalPendingSales: () => number
  getCreatorBalance: (monthYear: string, creatorId: string) => number
}

const defaultSettings: Settings = {
  shopName: "Le Petit Ruban",
  shopSubtitle: "Boutique Multi-Créateurs",
  address: "",
  email: "",
  phone: "",
  siret: "",
  defaultCommission: 30,
  participationAmount: 50,
  currency: "EUR",
}

export const useStore = create<BoutiqueState>()(
  persist(
    (set, get) => ({
      creators: [],
      stockData: [],
      monthlyData: {},
      payments: [],
      settings: defaultSettings,

      // Creator actions
      addCreator: (creator) => {
        const newCreator: Creator = {
          ...creator,
          id: `creator-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          creators: [...state.creators, newCreator],
        }))
      },

      updateCreator: (id, updates) => {
        set((state) => ({
          creators: state.creators.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : c,
          ),
        }))
      },

      deleteCreator: (id) => {
        set((state) => ({
          creators: state.creators.filter((c) => c.id !== id),
        }))
      },

      // Stock actions
      addStockItem: (item) => {
        const newItem: StockItem = {
          ...item,
          id: `stock-${Date.now()}`,
          soldQuantity: 0,
          status: "available",
          addedDate: new Date().toISOString(),
        }
        set((state) => ({
          stockData: [...state.stockData, newItem],
        }))
      },

      updateStockItem: (id, updates) => {
        set((state) => ({
          stockData: state.stockData.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }))
      },

      deleteStockItem: (id) => {
        set((state) => ({
          stockData: state.stockData.filter((item) => item.id !== id),
        }))
      },

      markAsSold: (id) => {
        set((state) => ({
          stockData: state.stockData.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "sold" as const,
                  soldDate: new Date().toISOString(),
                }
              : item,
          ),
        }))
      },

      // Sales actions
      addSale: (monthYear, sale) => {
        const newSale: Sale = {
          ...sale,
          id: `sale-${Date.now()}-${Math.random()}`,
        }
        set((state) => {
          const monthData = state.monthlyData[monthYear] || {
            salesData: [],
            participations: [],
          }
          return {
            monthlyData: {
              ...state.monthlyData,
              [monthYear]: {
                ...monthData,
                salesData: [...monthData.salesData, newSale],
              },
            },
          }
        })
      },

      updateSale: (monthYear, saleId, updates) => {
        set((state) => {
          const monthData = state.monthlyData[monthYear]
          if (!monthData) return state

          return {
            monthlyData: {
              ...state.monthlyData,
              [monthYear]: {
                ...monthData,
                salesData: monthData.salesData.map((sale) => (sale.id === saleId ? { ...sale, ...updates } : sale)),
              },
            },
          }
        })
      },

      deleteSale: (monthYear, saleId) => {
        set((state) => {
          const monthData = state.monthlyData[monthYear]
          if (!monthData) return state

          return {
            monthlyData: {
              ...state.monthlyData,
              [monthYear]: {
                ...monthData,
                salesData: monthData.salesData.filter((sale) => sale.id !== saleId),
              },
            },
          }
        })
      },

      importSales: (monthYear, sales) => {
        const newSales = sales.map((sale) => ({
          ...sale,
          id: `sale-${Date.now()}-${Math.random()}`,
        }))

        set((state) => {
          const monthData = state.monthlyData[monthYear] || {
            salesData: [],
            participations: [],
          }
          return {
            monthlyData: {
              ...state.monthlyData,
              [monthYear]: {
                ...monthData,
                salesData: [...monthData.salesData, ...newSales],
              },
            },
          }
        })
      },

      // Payment actions
      addPayment: (payment) => {
        const newPayment: Payment = {
          ...payment,
          id: `payment-${Date.now()}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          payments: [...state.payments, newPayment],
        }))
      },

      updatePayment: (id, updates) => {
        set((state) => ({
          payments: state.payments.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }))
      },

      deletePayment: (id) => {
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
        }))
      },

      // Participation actions
      addParticipation: (monthYear, participation) => {
        const newParticipation: Participation = {
          ...participation,
          id: `participation-${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => {
          const monthData = state.monthlyData[monthYear] || {
            salesData: [],
            participations: [],
          }
          return {
            monthlyData: {
              ...state.monthlyData,
              [monthYear]: {
                ...monthData,
                participations: [...monthData.participations, newParticipation],
              },
            },
          }
        })
      },

      updateParticipation: (monthYear, participationId, updates) => {
        set((state) => {
          const monthData = state.monthlyData[monthYear]
          if (!monthData) return state

          return {
            monthlyData: {
              ...state.monthlyData,
              [monthYear]: {
                ...monthData,
                participations: monthData.participations.map((p) =>
                  p.id === participationId ? { ...p, ...updates } : p,
                ),
              },
            },
          }
        })
      },

      deleteParticipation: (monthYear, participationId) => {
        set((state) => {
          const monthData = state.monthlyData[monthYear]
          if (!monthData) return state

          return {
            monthlyData: {
              ...state.monthlyData,
              [monthYear]: {
                ...monthData,
                participations: monthData.participations.filter((p) => p.id !== participationId),
              },
            },
          }
        })
      },

      markParticipationPaid: (monthYear, participationId) => {
        set((state) => {
          const monthData = state.monthlyData[monthYear]
          if (!monthData) return state

          return {
            monthlyData: {
              ...state.monthlyData,
              [monthYear]: {
                ...monthData,
                participations: monthData.participations.map((p) =>
                  p.id === participationId
                    ? {
                        ...p,
                        status: "paid" as const,
                        paidDate: new Date().toISOString(),
                      }
                    : p,
                ),
              },
            },
          }
        })
      },

      // Settings actions
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }))
      },

      // Utility functions
      getCreatorById: (id) => {
        return get().creators.find((c) => c.id === id)
      },

      getStockByCreator: (creatorId) => {
        return get().stockData.filter((item) => item.creatorId === creatorId)
      },

      getSalesByCreator: (monthYear, creatorId) => {
        const monthData = get().monthlyData[monthYear]
        if (!monthData) return []
        return monthData.salesData.filter((sale) => sale.creatorId === creatorId)
      },

      getTotalSales: (monthYear) => {
        const monthData = get().monthlyData[monthYear]
        if (!monthData) return 0
        return monthData.salesData.reduce((sum, sale) => sum + (sale.montant || 0), 0)
      },

      getTotalPendingSales: () => {
        const monthlyData = get().monthlyData
        let total = 0
        Object.values(monthlyData).forEach((month) => {
          total += month.salesData.filter((sale) => !sale.validated).length
        })
        return total
      },

      getCreatorBalance: (monthYear, creatorId) => {
        const sales = get().getSalesByCreator(monthYear, creatorId)
        const creator = get().getCreatorById(creatorId)
        if (!creator) return 0

        const totalSales = sales.reduce((sum, sale) => sum + (sale.montant || 0), 0)
        const commission = (totalSales * creator.commission) / 100
        return totalSales - commission
      },
    }),
    {
      name: "boutique-storage",
    },
  ),
)
