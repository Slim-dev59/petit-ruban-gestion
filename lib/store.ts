import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Creator {
  id: string
  name: string
  commission: number
  color: string
  isActive: boolean
}

export interface StockItem {
  id: string
  name: string
  price: number
  quantity: number
  creatorId: string
  category?: string
}

export interface Sale {
  id: string
  itemName: string
  price: number
  quantity: number
  total: number
  creatorId: string
  creatorName: string
  commission: number
  date: string
  isValidated: boolean
}

export interface MonthlyData {
  creators: Creator[]
  stock: StockItem[]
  sales: Sale[]
  settings: {
    defaultCommission: number
    stockTemplate: {
      nameColumn: string
      priceColumn: string
      quantityColumn: string
      creatorColumn: string
    }
    salesTemplate: {
      itemColumn: string
      priceColumn: string
      quantityColumn: string
      dateColumn: string
    }
  }
}

interface StoreState {
  currentMonth: string
  monthlyData: Record<string, MonthlyData>
  isAuthenticated: boolean

  // Actions
  setCurrentMonth: (month: string) => void
  getCurrentData: () => MonthlyData
  updateCurrentData: (data: Partial<MonthlyData>) => void
  setAuthenticated: (authenticated: boolean) => void

  // Creator actions
  addCreator: (creator: Omit<Creator, "id">) => void
  updateCreator: (id: string, updates: Partial<Creator>) => void
  deleteCreator: (id: string) => void

  // Stock actions
  addStockItem: (item: Omit<StockItem, "id">) => void
  updateStockItem: (id: string, updates: Partial<StockItem>) => void
  deleteStockItem: (id: string) => void
  setStock: (stock: StockItem[]) => void

  // Sales actions
  addSale: (sale: Omit<Sale, "id">) => void
  updateSale: (id: string, updates: Partial<Sale>) => void
  deleteSale: (id: string) => void
  setSales: (sales: Sale[]) => void

  // Settings actions
  updateSettings: (settings: Partial<MonthlyData["settings"]>) => void
}

const defaultData: MonthlyData = {
  creators: [],
  stock: [],
  sales: [],
  settings: {
    defaultCommission: 1.75,
    stockTemplate: {
      nameColumn: "Nom",
      priceColumn: "Prix",
      quantityColumn: "Quantité",
      creatorColumn: "Créateur",
    },
    salesTemplate: {
      itemColumn: "Article",
      priceColumn: "Prix",
      quantityColumn: "Quantité",
      dateColumn: "Date",
    },
  },
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
      monthlyData: {},
      isAuthenticated: false,

      setCurrentMonth: (month: string) => set({ currentMonth: month }),

      getCurrentData: () => {
        const { currentMonth, monthlyData } = get()
        return monthlyData[currentMonth] || defaultData
      },

      updateCurrentData: (data: Partial<MonthlyData>) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || defaultData

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              ...data,
            },
          },
        })
      },

      setAuthenticated: (authenticated: boolean) => set({ isAuthenticated: authenticated }),

      // Creator actions
      addCreator: (creator) => {
        const currentData = get().getCurrentData()
        const newCreator = {
          ...creator,
          id: Date.now().toString(),
        }

        get().updateCurrentData({
          creators: [...currentData.creators, newCreator],
        })
      },

      updateCreator: (id: string, updates: Partial<Creator>) => {
        const currentData = get().getCurrentData()
        const updatedCreators = currentData.creators.map((creator) =>
          creator.id === id ? { ...creator, ...updates } : creator,
        )

        get().updateCurrentData({ creators: updatedCreators })
      },

      deleteCreator: (id: string) => {
        const currentData = get().getCurrentData()
        const filteredCreators = currentData.creators.filter((creator) => creator.id !== id)

        get().updateCurrentData({ creators: filteredCreators })
      },

      // Stock actions
      addStockItem: (item) => {
        const currentData = get().getCurrentData()
        const newItem = {
          ...item,
          id: Date.now().toString(),
        }

        get().updateCurrentData({
          stock: [...currentData.stock, newItem],
        })
      },

      updateStockItem: (id: string, updates: Partial<StockItem>) => {
        const currentData = get().getCurrentData()
        const updatedStock = currentData.stock.map((item) => (item.id === id ? { ...item, ...updates } : item))

        get().updateCurrentData({ stock: updatedStock })
      },

      deleteStockItem: (id: string) => {
        const currentData = get().getCurrentData()
        const filteredStock = currentData.stock.filter((item) => item.id !== id)

        get().updateCurrentData({ stock: filteredStock })
      },

      setStock: (stock: StockItem[]) => {
        get().updateCurrentData({ stock })
      },

      // Sales actions
      addSale: (sale) => {
        const currentData = get().getCurrentData()
        const newSale = {
          ...sale,
          id: Date.now().toString(),
        }

        get().updateCurrentData({
          sales: [...currentData.sales, newSale],
        })
      },

      updateSale: (id: string, updates: Partial<Sale>) => {
        const currentData = get().getCurrentData()
        const updatedSales = currentData.sales.map((sale) => (sale.id === id ? { ...sale, ...updates } : sale))

        get().updateCurrentData({ sales: updatedSales })
      },

      deleteSale: (id: string) => {
        const currentData = get().getCurrentData()
        const filteredSales = currentData.sales.filter((sale) => sale.id !== id)

        get().updateCurrentData({ sales: filteredSales })
      },

      setSales: (sales: Sale[]) => {
        get().updateCurrentData({ sales })
      },

      // Settings actions
      updateSettings: (settings: Partial<MonthlyData["settings"]>) => {
        const currentData = get().getCurrentData()

        get().updateCurrentData({
          settings: {
            ...currentData.settings,
            ...settings,
          },
        })
      },
    }),
    {
      name: "petit-ruban-storage",
      partialize: (state) => ({
        currentMonth: state.currentMonth,
        monthlyData: state.monthlyData,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
