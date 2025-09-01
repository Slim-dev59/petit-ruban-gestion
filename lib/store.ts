import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Creator {
  id: string
  name: string
  commission: number
  totalSales: number
  totalItems: number
  color: string
  email?: string
  phone?: string
  address?: string
  notes?: string
}

export interface StockItem {
  id: string
  creatorId: string
  creatorName: string
  name: string
  price: number
  quantity: number
  category?: string
  description?: string
  sku?: string
  minStock?: number
  maxStock?: number
  location?: string
}

export interface Sale {
  id: string
  creatorId: string
  creatorName: string
  itemName: string
  price: number
  quantity: number
  date: string
  description: string
  identified: boolean
  commission?: number
  totalAmount?: number
  paymentMethod?: string
  customerInfo?: string
  notes?: string
}

export interface Payment {
  id: string
  creatorId: string
  creatorName: string
  amount: number
  commission: number
  date: string
  period: string
  status: "pending" | "paid" | "cancelled"
  method?: string
  reference?: string
  notes?: string
}

export interface Settings {
  shopName: string
  shopAddress: string
  shopPhone: string
  shopEmail: string
  defaultCommission: number
  currency: string
  taxRate: number
  logo?: string
  theme: "light" | "dark"
  language: "fr" | "en"
}

interface AppState {
  // Data
  creators: Creator[]
  stock: StockItem[]
  sales: Sale[]
  payments: Payment[]
  settings: Settings
  isAuthenticated: boolean

  // Creator actions
  addCreator: (creator: Omit<Creator, "id">) => void
  updateCreator: (id: string, updates: Partial<Creator>) => void
  deleteCreator: (id: string) => void

  // Stock actions
  addStockItems: (items: Omit<StockItem, "id">[]) => void
  updateStockItem: (id: string, updates: Partial<StockItem>) => void
  deleteStockItem: (id: string) => void
  bulkUpdateStock: (updates: { id: string; quantity: number }[]) => void

  // Sales actions
  addSales: (sales: Omit<Sale, "id">[]) => void
  updateSale: (id: string, updates: Partial<Sale>) => void
  deleteSale: (id: string) => void
  reassignSale: (saleId: string, creatorId: string) => void
  bulkReassignSales: (saleIds: string[], creatorId: string) => void

  // Payment actions
  addPayment: (payment: Omit<Payment, "id">) => void
  updatePayment: (id: string, updates: Partial<Payment>) => void
  deletePayment: (id: string) => void
  generatePayments: (period: string) => void

  // Settings actions
  updateSettings: (updates: Partial<Settings>) => void

  // Auth actions
  setAuthenticated: (auth: boolean) => void

  // Utility functions
  getCreatorById: (id: string) => Creator | undefined
  getCreatorByName: (name: string) => Creator | undefined
  getStockByCreator: (creatorId: string) => StockItem[]
  getSalesByCreator: (creatorId: string) => Sale[]
  getSalesByPeriod: (startDate: string, endDate: string) => Sale[]
  getUnidentifiedSales: () => Sale[]
  getLowStockItems: () => StockItem[]

  // Data management
  exportData: () => string
  importData: (data: string) => boolean
  clearAllData: () => void
  getStatistics: () => {
    totalCreators: number
    totalStock: number
    totalSales: number
    totalRevenue: number
    unidentifiedSales: number
    lowStockItems: number
  }
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const colors = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
]

const defaultSettings: Settings = {
  shopName: "Petit-Ruban",
  shopAddress: "",
  shopPhone: "",
  shopEmail: "",
  defaultCommission: 15,
  currency: "€",
  taxRate: 20,
  theme: "light",
  language: "fr",
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      creators: [],
      stock: [],
      sales: [],
      payments: [],
      settings: defaultSettings,
      isAuthenticated: false,

      addCreator: (creator) =>
        set((state) => ({
          creators: [
            ...state.creators,
            {
              ...creator,
              id: generateId(),
              color: colors[state.creators.length % colors.length],
            },
          ],
        })),

      updateCreator: (id, updates) =>
        set((state) => ({
          creators: state.creators.map((creator) => (creator.id === id ? { ...creator, ...updates } : creator)),
        })),

      deleteCreator: (id) =>
        set((state) => ({
          creators: state.creators.filter((creator) => creator.id !== id),
          stock: state.stock.filter((item) => item.creatorId !== id),
          sales: state.sales.filter((sale) => sale.creatorId !== id),
          payments: state.payments.filter((payment) => payment.creatorId !== id),
        })),

      addStockItems: (items) =>
        set((state) => ({
          stock: [...state.stock, ...items.map((item) => ({ ...item, id: generateId() }))],
        })),

      updateStockItem: (id, updates) =>
        set((state) => ({
          stock: state.stock.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        })),

      deleteStockItem: (id) =>
        set((state) => ({
          stock: state.stock.filter((item) => item.id !== id),
        })),

      bulkUpdateStock: (updates) =>
        set((state) => ({
          stock: state.stock.map((item) => {
            const update = updates.find((u) => u.id === item.id)
            return update ? { ...item, quantity: update.quantity } : item
          }),
        })),

      addSales: (sales) => {
        const newSales = sales.map((sale) => ({
          ...sale,
          id: generateId(),
          totalAmount: sale.price * sale.quantity,
          commission: sale.commission || get().settings.defaultCommission,
        }))

        set((state) => ({
          sales: [...state.sales, ...newSales],
        }))

        // Mettre à jour les statistiques des créateurs
        const { creators } = get()
        const updatedCreators = creators.map((creator) => {
          const creatorSales = newSales.filter((sale) => sale.creatorId === creator.id)
          const totalSales = creatorSales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0)
          const totalItems = creatorSales.reduce((sum, sale) => sum + sale.quantity, 0)

          return {
            ...creator,
            totalSales: creator.totalSales + totalSales,
            totalItems: creator.totalItems + totalItems,
          }
        })

        set({ creators: updatedCreators })
      },

      updateSale: (id, updates) =>
        set((state) => ({
          sales: state.sales.map((sale) =>
            sale.id === id
              ? {
                  ...sale,
                  ...updates,
                  totalAmount: (updates.price || sale.price) * (updates.quantity || sale.quantity),
                }
              : sale,
          ),
        })),

      deleteSale: (id) =>
        set((state) => ({
          sales: state.sales.filter((sale) => sale.id !== id),
        })),

      reassignSale: (saleId, creatorId) => {
        const { creators } = get()
        const creator = creators.find((c) => c.id === creatorId)

        if (creator) {
          set((state) => ({
            sales: state.sales.map((sale) =>
              sale.id === saleId ? { ...sale, creatorId, creatorName: creator.name, identified: true } : sale,
            ),
          }))
        }
      },

      bulkReassignSales: (saleIds, creatorId) => {
        const { creators } = get()
        const creator = creators.find((c) => c.id === creatorId)

        if (creator) {
          set((state) => ({
            sales: state.sales.map((sale) =>
              saleIds.includes(sale.id) ? { ...sale, creatorId, creatorName: creator.name, identified: true } : sale,
            ),
          }))
        }
      },

      addPayment: (payment) =>
        set((state) => ({
          payments: [...state.payments, { ...payment, id: generateId() }],
        })),

      updatePayment: (id, updates) =>
        set((state) => ({
          payments: state.payments.map((payment) => (payment.id === id ? { ...payment, ...updates } : payment)),
        })),

      deletePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id),
        })),

      generatePayments: (period) => {
        const { creators, sales, settings } = get()
        const newPayments: Omit<Payment, "id">[] = []

        creators.forEach((creator) => {
          const creatorSales = sales.filter(
            (sale) => sale.creatorId === creator.id && sale.identified && sale.date.startsWith(period),
          )

          if (creatorSales.length > 0) {
            const totalAmount = creatorSales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0)
            const commission = (creator.commission / 100) * totalAmount

            newPayments.push({
              creatorId: creator.id,
              creatorName: creator.name,
              amount: commission,
              commission: creator.commission,
              date: new Date().toISOString().split("T")[0],
              period,
              status: "pending",
            })
          }
        })

        set((state) => ({
          payments: [...state.payments, ...newPayments.map((p) => ({ ...p, id: generateId() }))],
        }))
      },

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      setAuthenticated: (auth) => set({ isAuthenticated: auth }),

      getCreatorById: (id) => get().creators.find((creator) => creator.id === id),

      getCreatorByName: (name) => get().creators.find((creator) => creator.name.toLowerCase() === name.toLowerCase()),

      getStockByCreator: (creatorId) => get().stock.filter((item) => item.creatorId === creatorId),

      getSalesByCreator: (creatorId) => get().sales.filter((sale) => sale.creatorId === creatorId),

      getSalesByPeriod: (startDate, endDate) =>
        get().sales.filter((sale) => sale.date >= startDate && sale.date <= endDate),

      getUnidentifiedSales: () => get().sales.filter((sale) => !sale.identified),

      getLowStockItems: () => get().stock.filter((item) => item.minStock && item.quantity <= item.minStock),

      exportData: () => {
        const { creators, stock, sales, payments, settings } = get()
        return JSON.stringify({ creators, stock, sales, payments, settings }, null, 2)
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data)
          set({
            creators: parsed.creators || [],
            stock: parsed.stock || [],
            sales: parsed.sales || [],
            payments: parsed.payments || [],
            settings: { ...defaultSettings, ...parsed.settings },
          })
          return true
        } catch {
          return false
        }
      },

      clearAllData: () =>
        set({
          creators: [],
          stock: [],
          sales: [],
          payments: [],
        }),

      getStatistics: () => {
        const { creators, stock, sales } = get()
        return {
          totalCreators: creators.length,
          totalStock: stock.reduce((sum, item) => sum + item.quantity, 0),
          totalSales: sales.length,
          totalRevenue: sales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0),
          unidentifiedSales: sales.filter((sale) => !sale.identified).length,
          lowStockItems: stock.filter((item) => item.minStock && item.quantity <= item.minStock).length,
        }
      },
    }),
    {
      name: "boutique-storage",
      partialize: (state) => ({
        creators: state.creators,
        stock: state.stock,
        sales: state.sales,
        payments: state.payments,
        settings: state.settings,
      }),
    },
  ),
)
