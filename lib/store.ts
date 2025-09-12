"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Sale {
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

interface Settings {
  commissionRate: number
  shopName: string
  autoApplyCommission: boolean
  logo?: string
}

interface MonthlyData {
  salesData: Sale[]
  payments: Payment[]
}

interface Store {
  creators: string[]
  stockData: StockItem[]
  monthlyData: Record<string, MonthlyData>
  currentMonth: string
  settings: Settings

  // Gestion des mois
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

  addPayment: (payment: Omit<Payment, "id" | "dateCreation">, month?: string) => void
  getPaymentsForCreator: (creator: string, month?: string) => Payment[]
  payCreatorAndReset: (
    creator: string,
    paymentData: Omit<Payment, "id" | "dateCreation" | "createur" | "ventesPayees">,
    month?: string,
  ) => void
  getAllSalesForCreator: (creator: string, month?: string) => Sale[]
  getPaidSalesForCreator: (creator: string, month?: string) => Sale[]

  // Nouvelles fonctions pour les données globales
  salesData: Sale[] // Données du mois courant pour compatibilité
  payments: Payment[] // Paiements du mois courant pour compatibilité
}

const getDefaultMonthlyData = (): MonthlyData => ({
  salesData: [],
  payments: [],
})

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      creators: [],
      stockData: [],
      monthlyData: {},
      currentMonth: new Date().toISOString().slice(0, 7), // Format YYYY-MM
      settings: {
        commissionRate: 1.75,
        shopName: "Ma Boutique Multi-Créateurs",
        autoApplyCommission: true,
      },

      // Propriétés calculées pour compatibilité
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
        const salesWithStatus = data.map((sale) => ({
          ...sale,
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

        console.log(`${salesWithStatus.length} ventes importées pour ${targetMonth}`)
      },

      importStockData: (data) => {
        console.log("Import stock data - données reçues:", data.length)

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

        // Ajouter automatiquement les créateurs trouvés
        const creatorsFound = [...new Set(processedData.map((item) => item.createur))]
        creatorsFound.forEach((creator) => {
          if (creator && !get().creators.includes(creator)) {
            get().addCreator(creator)
          }
        })

        console.log("Créateurs ajoutés:", creatorsFound)
        console.log("Articles traités:", processedData.length)

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
        set({ settings })
      },

      updateCreatorMapping: (mapping) => {
        set((state) => {
          const updatedStockData = state.stockData.map((item) => ({
            ...item,
            createur: mapping[item.createur] || item.createur,
          }))

          return {
            stockData: updatedStockData,
          }
        })
      },

      resetAllData: () => {
        set({
          creators: [],
          stockData: [],
          monthlyData: {},
          settings: {
            commissionRate: 1.75,
            shopName: "Ma Boutique Multi-Créateurs",
            autoApplyCommission: true,
          },
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

        console.log(`Paiement effectué pour ${creator} (${targetMonth}): ${netAmount.toFixed(2)}€`)
        console.log(`${creatorSales.length} ventes archivées sous le paiement ${paymentId}`)
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
    }),
    {
      name: "boutique-storage",
    },
  ),
)
