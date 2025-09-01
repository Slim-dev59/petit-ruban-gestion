import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Creator {
  id: string
  name: string
  commission: number
  isActive: boolean
  totalSales: number
  totalCommission: number
}

export interface StockItem {
  id: string
  name: string
  creator: string
  price: number
  quantity: number
  category: string
  description?: string
}

export interface Sale {
  id: string
  itemName: string
  creator: string
  price: number
  quantity: number
  date: string
  commission: number
  isValidated: boolean
}

export interface MonthlyData {
  stock: StockItem[]
  sales: Sale[]
  creators: Creator[]
}

export interface ImportTemplate {
  id: string
  name: string
  type: "stock" | "sales"
  columns: {
    name?: string
    creator?: string
    price?: string
    quantity?: string
    date?: string
    category?: string
    description?: string
  }
}

interface Store {
  // État global
  isAuthenticated: boolean
  currentMonth: string

  // Données mensuelles
  monthlyData: Record<string, MonthlyData>

  // Templates d'import
  importTemplates: ImportTemplate[]

  // Actions globales
  setAuthenticated: (authenticated: boolean) => void
  setCurrentMonth: (month: string) => void

  // Actions pour les données mensuelles
  getCurrentMonthData: () => MonthlyData
  updateMonthlyData: (month: string, data: Partial<MonthlyData>) => void

  // Actions pour les créateurs
  addCreator: (creator: Omit<Creator, "id">) => void
  updateCreator: (id: string, updates: Partial<Creator>) => void
  deleteCreator: (id: string) => void

  // Actions pour le stock
  addStockItem: (item: Omit<StockItem, "id">) => void
  updateStockItem: (id: string, updates: Partial<StockItem>) => void
  deleteStockItem: (id: string) => void
  importStock: (items: Omit<StockItem, "id">[]) => void

  // Actions pour les ventes
  addSale: (sale: Omit<Sale, "id">) => void
  updateSale: (id: string, updates: Partial<Sale>) => void
  deleteSale: (id: string) => void
  importSales: (sales: Omit<Sale, "id">[]) => void

  // Actions pour les templates
  addImportTemplate: (template: Omit<ImportTemplate, "id">) => void
  updateImportTemplate: (id: string, updates: Partial<ImportTemplate>) => void
  deleteImportTemplate: (id: string) => void

  // Utilitaires
  calculateCreatorStats: () => void
  exportData: (month: string) => MonthlyData
  clearMonthData: (month: string) => void
}

const defaultMonthlyData: MonthlyData = {
  stock: [],
  sales: [],
  creators: [],
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // État initial
      isAuthenticated: false,
      currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
      monthlyData: {},
      importTemplates: [
        {
          id: "default-stock",
          name: "Template Stock par défaut",
          type: "stock",
          columns: {
            name: "Nom",
            creator: "Créateur",
            price: "Prix",
            quantity: "Quantité",
            category: "Catégorie",
          },
        },
        {
          id: "default-sales",
          name: "Template Ventes par défaut",
          type: "sales",
          columns: {
            name: "Article",
            creator: "Créateur",
            price: "Prix",
            quantity: "Quantité",
            date: "Date",
          },
        },
      ],

      // Actions globales
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      setCurrentMonth: (month) => set({ currentMonth: month }),

      // Actions pour les données mensuelles
      getCurrentMonthData: () => {
        const { currentMonth, monthlyData } = get()
        return monthlyData[currentMonth] || defaultMonthlyData
      },

      updateMonthlyData: (month, data) =>
        set((state) => ({
          monthlyData: {
            ...state.monthlyData,
            [month]: {
              ...defaultMonthlyData,
              ...state.monthlyData[month],
              ...data,
            },
          },
        })),

      // Actions pour les créateurs
      addCreator: (creator) =>
        set((state) => {
          const currentData = state.monthlyData[state.currentMonth] || defaultMonthlyData
          const newCreator = {
            ...creator,
            id: Date.now().toString(),
          }

          return {
            monthlyData: {
              ...state.monthlyData,
              [state.currentMonth]: {
                ...currentData,
                creators: [...currentData.creators, newCreator],
              },
            },
          }
        }),

      updateCreator: (id, updates) =>
        set((state) => {
          const currentData = state.monthlyData[state.currentMonth] || defaultMonthlyData

          return {
            monthlyData: {
              ...state.monthlyData,
              [state.currentMonth]: {
                ...currentData,
                creators: currentData.creators.map((creator) =>
                  creator.id === id ? { ...creator, ...updates } : creator,
                ),
              },
            },
          }
        }),

      deleteCreator: (id) =>
        set((state) => {
          const currentData = state.monthlyData[state.currentMonth] || defaultMonthlyData

          return {
            monthlyData: {
              ...state.monthlyData,
              [state.currentMonth]: {
                ...currentData,
                creators: currentData.creators.filter((creator) => creator.id !== id),
              },
            },
          }
        }),

      // Actions pour le stock
      addStockItem: (item) =>
        set((state) => {
          const currentData = state.monthlyData[state.currentMonth] || defaultMonthlyData
          const newItem = {
            ...item,
            id: Date.now().toString(),
          }

          return {
            monthlyData: {
              ...state.monthlyData,
              [state.currentMonth]: {
                ...currentData,
                stock: [...currentData.stock, newItem],
              },
            },
          }
        }),

      updateStockItem: (id, updates) =>
        set((state) => {
          const currentData = state.monthlyData[state.currentMonth] || defaultMonthlyData

          return {
            monthlyData: {
              ...state.monthlyData,
              [state.currentMonth]: {
                ...currentData,
                stock: currentData.stock.map((item) => (item.id === id ? { ...item, ...updates } : item)),
              },
            },
          }
        }),

      deleteStockItem: (id) =>
        set((state) => {
          const currentData = state.monthlyData[state.currentMonth] || defaultMonthlyData

          return {
            monthlyData: {
              ...state.monthlyData,
              [state.currentMonth]: {
                ...currentData,
                stock: currentData.stock.filter((item) => item.id !== id),
              },
            },
          }
        }),

      importStock: (items) =>
        set((state) => {
          const currentData = state.monthlyData[state.currentMonth] || defaultMonthlyData
          const newItems = items.map((item) => ({
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          }))

          return {
            monthlyData: {
              ...state.monthlyData,
              [state.currentMonth]: {
                ...currentData,
                stock: [...currentData.stock, ...newItems],
              },
            },
          }
        }),

      // Actions pour les ventes
      addSale: (sale) =>
        set((state) => {
          const currentData = state.monthlyData[state.currentMonth] || defaultMonthlyData
          const newSale = {
            ...sale,
            id: Date.now().toString(),
          }

          return {
            monthlyData: {
              ...state.monthlyData,
              [state.currentMonth]: {
                ...currentData,
                sales: [...currentData.sales, newSale],
              },
            },
          }
        }),

      updateSale: (id, updates) =>
        set((state) => {
          const currentData = state.monthlyData[state.currentMonth] || defaultMonthlyData

          return {
            monthlyData: {
              ...state.monthlyData,
              [state.currentMonth]: {
                ...currentData,
                sales: currentData.sales.map((sale) => (sale.id === id ? { ...sale, ...updates } : sale)),
              },
            },
          }
        }),

      deleteSale: (id) =>
        set((state) => {
          const currentData = state.monthlyData[state.currentMonth] || defaultMonthlyData

          return {
            monthlyData: {
              ...state.monthlyData,
              [state.currentMonth]: {
                ...currentData,
                sales: currentData.sales.filter((sale) => sale.id !== id),
              },
            },
          }
        }),

      importSales: (sales) =>
        set((state) => {
          const currentData = state.monthlyData[state.currentMonth] || defaultMonthlyData
          const newSales = sales.map((sale) => ({
            ...sale,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          }))

          return {
            monthlyData: {
              ...state.monthlyData,
              [state.currentMonth]: {
                ...currentData,
                sales: [...currentData.sales, ...newSales],
              },
            },
          }
        }),

      // Actions pour les templates
      addImportTemplate: (template) =>
        set((state) => ({
          importTemplates: [
            ...state.importTemplates,
            {
              ...template,
              id: Date.now().toString(),
            },
          ],
        })),

      updateImportTemplate: (id, updates) =>
        set((state) => ({
          importTemplates: state.importTemplates.map((template) =>
            template.id === id ? { ...template, ...updates } : template,
          ),
        })),

      deleteImportTemplate: (id) =>
        set((state) => ({
          importTemplates: state.importTemplates.filter((template) => template.id !== id),
        })),

      // Utilitaires
      calculateCreatorStats: () =>
        set((state) => {
          const currentData = state.monthlyData[state.currentMonth] || defaultMonthlyData
          const updatedCreators = currentData.creators.map((creator) => {
            const creatorSales = currentData.sales.filter((sale) => sale.creator === creator.name)
            const totalSales = creatorSales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0)
            const totalCommission = creatorSales.reduce((sum, sale) => sum + sale.commission, 0)

            return {
              ...creator,
              totalSales,
              totalCommission,
            }
          })

          return {
            monthlyData: {
              ...state.monthlyData,
              [state.currentMonth]: {
                ...currentData,
                creators: updatedCreators,
              },
            },
          }
        }),

      exportData: (month) => {
        const { monthlyData } = get()
        return monthlyData[month] || defaultMonthlyData
      },

      clearMonthData: (month) =>
        set((state) => {
          const newMonthlyData = { ...state.monthlyData }
          delete newMonthlyData[month]
          return { monthlyData: newMonthlyData }
        }),
    }),
    {
      name: "petit-ruban-storage",
      partialize: (state) => ({
        monthlyData: state.monthlyData,
        importTemplates: state.importTemplates,
        currentMonth: state.currentMonth,
      }),
    },
  ),
)
