import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Creator {
  id: string
  name: string
  commission: number
  isActive: boolean
  createdAt: string
}

export interface StockItem {
  id: string
  name: string
  creator: string
  price: number
  quantity: number
  category?: string
}

export interface Sale {
  id: string
  itemName: string
  creator: string
  price: number
  commission: number
  date: string
  isValidated: boolean
  originalData?: any
}

export interface MonthlyData {
  creators: Creator[]
  stock: StockItem[]
  sales: Sale[]
  settings: {
    defaultCommission: number
    stockTemplate: {
      nameColumn: string
      creatorColumn: string
      priceColumn: string
      quantityColumn: string
    }
    salesTemplate: {
      nameColumn: string
      priceColumn: string
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
  setAuthenticated: (authenticated: boolean) => void

  // Creators
  addCreator: (creator: Omit<Creator, "id" | "createdAt">) => void
  updateCreator: (id: string, updates: Partial<Creator>) => void
  deleteCreator: (id: string) => void

  // Stock
  setStock: (stock: StockItem[]) => void
  addStockItem: (item: Omit<StockItem, "id">) => void
  updateStockItem: (id: string, updates: Partial<StockItem>) => void
  deleteStockItem: (id: string) => void

  // Sales
  setSales: (sales: Sale[]) => void
  addSale: (sale: Omit<Sale, "id">) => void
  updateSale: (id: string, updates: Partial<Sale>) => void
  deleteSale: (id: string) => void

  // Settings
  updateSettings: (settings: Partial<MonthlyData["settings"]>) => void
}

const defaultSettings = {
  defaultCommission: 1.75,
  stockTemplate: {
    nameColumn: "Nom",
    creatorColumn: "Créateur",
    priceColumn: "Prix",
    quantityColumn: "Quantité",
  },
  salesTemplate: {
    nameColumn: "Article",
    priceColumn: "Prix",
    dateColumn: "Date",
  },
}

const getDefaultMonthlyData = (): MonthlyData => ({
  creators: [],
  stock: [],
  sales: [],
  settings: defaultSettings,
})

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
      monthlyData: {},
      isAuthenticated: false,

      setCurrentMonth: (month: string) => {
        set({ currentMonth: month })
      },

      getCurrentData: () => {
        const { currentMonth, monthlyData } = get()
        return monthlyData[currentMonth] || getDefaultMonthlyData()
      },

      setAuthenticated: (authenticated: boolean) => {
        set({ isAuthenticated: authenticated })
      },

      addCreator: (creator) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        const newCreator: Creator = {
          ...creator,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              creators: [...currentData.creators, newCreator],
            },
          },
        })
      },

      updateCreator: (id, updates) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              creators: currentData.creators.map((creator) =>
                creator.id === id ? { ...creator, ...updates } : creator,
              ),
            },
          },
        })
      },

      deleteCreator: (id) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              creators: currentData.creators.filter((creator) => creator.id !== id),
            },
          },
        })
      },

      setStock: (stock) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              stock,
            },
          },
        })
      },

      addStockItem: (item) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        const newItem: StockItem = {
          ...item,
          id: Date.now().toString(),
        }

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              stock: [...currentData.stock, newItem],
            },
          },
        })
      },

      updateStockItem: (id, updates) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              stock: currentData.stock.map((item) => (item.id === id ? { ...item, ...updates } : item)),
            },
          },
        })
      },

      deleteStockItem: (id) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              stock: currentData.stock.filter((item) => item.id !== id),
            },
          },
        })
      },

      setSales: (sales) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              sales,
            },
          },
        })
      },

      addSale: (sale) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        const newSale: Sale = {
          ...sale,
          id: Date.now().toString(),
        }

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              sales: [...currentData.sales, newSale],
            },
          },
        })
      },

      updateSale: (id, updates) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              sales: currentData.sales.map((sale) => (sale.id === id ? { ...sale, ...updates } : sale)),
            },
          },
        })
      },

      deleteSale: (id) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              sales: currentData.sales.filter((sale) => sale.id !== id),
            },
          },
        })
      },

      updateSettings: (settings) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        set({
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              settings: { ...currentData.settings, ...settings },
            },
          },
        })
      },
    }),
    {
      name: "petit-ruban-storage",
      version: 1,
    },
  ),
)
