"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Interfaces
export interface Creator {
  id: string
  name: string
  email: string
  phone?: string
  commission: number
  isActive: boolean
  createdAt: string
  totalSales?: number
  totalCommission?: number
}

export interface Product {
  id: string
  name: string
  price: number
  creatorId: string
  category?: string
  description?: string
  isActive: boolean
  createdAt: string
  stock?: number
}

export interface Sale {
  id: string
  productId?: string
  productName: string
  price: number
  quantity: number
  total: number
  creatorId?: string
  creatorName?: string
  date: string
  month: string
  isAssigned: boolean
  confidence?: number
  source?: string
}

export interface Payment {
  id: string
  creatorId: string
  amount: number
  type: "commission" | "rent" | "other"
  description?: string
  date: string
  month: string
  status: "pending" | "paid" | "cancelled"
}

export interface Participation {
  id: string
  creatorId: string
  month: string
  rentAmount: number
  isPaid: boolean
  paidDate?: string
  dueDate: string
}

export interface ImportHistory {
  id: string
  filename: string
  type: "sales" | "stock" | "creators"
  date: string
  recordsCount: number
  status: "success" | "error" | "partial"
  errors?: string[]
}

export interface User {
  id: string
  username: string
  email: string
  role: "admin" | "manager" | "viewer"
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

export interface Settings {
  companyName: string
  companyEmail: string
  defaultCommission: number
  monthlyRent: number
  currency: string
  timezone: string
  notifications: {
    email: boolean
    browser: boolean
    lowStock: boolean
    newSales: boolean
  }
  sumup: {
    clientId: string
    clientSecret: string
    accessToken?: string
    refreshToken?: string
    isConnected: boolean
    lastSync?: string
    autoSync: boolean
    syncInterval: number
  }
}

export interface MonthlyData {
  sales: Sale[]
  payments: Payment[]
  participations: Participation[]
}

interface StoreState {
  // Data
  creators: Creator[]
  products: Product[]
  monthlyData: Record<string, MonthlyData>
  importHistory: ImportHistory[]
  users: User[]
  settings: Settings

  // UI State
  isLoading: boolean
  error: string | null
  currentMonth: string

  // Creators
  addCreator: (creator: Omit<Creator, "id" | "createdAt">) => void
  updateCreator: (id: string, updates: Partial<Creator>) => void
  deleteCreator: (id: string) => void
  getCreator: (id: string) => Creator | undefined

  // Products
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined

  // Sales
  addSale: (sale: Omit<Sale, "id">) => void
  updateSale: (id: string, updates: Partial<Sale>) => void
  deleteSale: (id: string) => void
  getSale: (id: string) => Sale | undefined
  getSalesForMonth: (month: string) => Sale[]
  assignSaleToCreator: (saleId: string, creatorId: string) => void

  // Payments
  addPayment: (payment: Omit<Payment, "id">) => void
  updatePayment: (id: string, updates: Partial<Payment>) => void
  deletePayment: (id: string) => void
  getPayment: (id: string) => Payment | undefined
  getPaymentsForMonth: (month: string) => Payment[]

  // Participations
  addParticipation: (participation: Omit<Participation, "id">) => void
  updateParticipation: (id: string, updates: Partial<Participation>) => void
  deleteParticipation: (id: string) => void
  getParticipation: (id: string) => Participation | undefined
  getParticipationsForMonth: (month: string) => Participation[]

  // Import History
  addImportRecord: (record: Omit<ImportHistory, "id">) => void

  // Users
  addUser: (user: Omit<User, "id" | "createdAt">) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  getUser: (id: string) => User | undefined

  // Settings
  updateSettings: (updates: Partial<Settings>) => void

  // Analytics
  getTotalSales: (month?: string) => number
  getTotalCommissions: (month?: string) => number
  getCreatorStats: (
    creatorId: string,
    month?: string,
  ) => {
    totalSales: number
    totalCommission: number
    salesCount: number
  }
  getTotalPendingSales: () => number
  getMonthlyRevenue: (month: string) => number

  // Utility
  setCurrentMonth: (month: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearData: () => void
}

const defaultSettings: Settings = {
  companyName: "Le Petit Ruban",
  companyEmail: "contact@petit-ruban.fr",
  defaultCommission: 30,
  monthlyRent: 50,
  currency: "EUR",
  timezone: "Europe/Paris",
  notifications: {
    email: true,
    browser: true,
    lowStock: true,
    newSales: true,
  },
  sumup: {
    clientId: "",
    clientSecret: "",
    isConnected: false,
    autoSync: false,
    syncInterval: 60,
  },
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      creators: [],
      products: [],
      monthlyData: {},
      importHistory: [],
      users: [],
      settings: defaultSettings,
      isLoading: false,
      error: null,
      currentMonth: new Date().toISOString().slice(0, 7),

      // Creators
      addCreator: (creator) => {
        const newCreator: Creator = {
          ...creator,
          id: `creator-${Date.now()}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          creators: [...state.creators, newCreator],
        }))
      },

      updateCreator: (id, updates) => {
        set((state) => ({
          creators: state.creators.map((creator) => (creator.id === id ? { ...creator, ...updates } : creator)),
        }))
      },

      deleteCreator: (id) => {
        set((state) => ({
          creators: state.creators.filter((creator) => creator.id !== id),
        }))
      },

      getCreator: (id) => {
        return get().creators.find((creator) => creator.id === id)
      },

      // Products
      addProduct: (product) => {
        const newProduct: Product = {
          ...product,
          id: `product-${Date.now()}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          products: [...state.products, newProduct],
        }))
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((product) => (product.id === id ? { ...product, ...updates } : product)),
        }))
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }))
      },

      getProduct: (id) => {
        return get().products.find((product) => product.id === id)
      },

      // Sales
      addSale: (sale) => {
        const newSale: Sale = {
          ...sale,
          id: `sale-${Date.now()}`,
        }

        set((state) => {
          const month = sale.month
          const monthData = state.monthlyData[month] || { sales: [], payments: [], participations: [] }

          return {
            monthlyData: {
              ...state.monthlyData,
              [month]: {
                ...monthData,
                sales: [...monthData.sales, newSale],
              },
            },
          }
        })
      },

      updateSale: (id, updates) => {
        set((state) => {
          const newMonthlyData = { ...state.monthlyData }

          for (const month in newMonthlyData) {
            const monthData = newMonthlyData[month]
            const saleIndex = monthData.sales.findIndex((sale) => sale.id === id)

            if (saleIndex !== -1) {
              monthData.sales[saleIndex] = { ...monthData.sales[saleIndex], ...updates }
              break
            }
          }

          return { monthlyData: newMonthlyData }
        })
      },

      deleteSale: (id) => {
        set((state) => {
          const newMonthlyData = { ...state.monthlyData }

          for (const month in newMonthlyData) {
            const monthData = newMonthlyData[month]
            monthData.sales = monthData.sales.filter((sale) => sale.id !== id)
          }

          return { monthlyData: newMonthlyData }
        })
      },

      getSale: (id) => {
        const { monthlyData } = get()

        for (const month in monthlyData) {
          const sale = monthlyData[month].sales.find((sale) => sale.id === id)
          if (sale) return sale
        }

        return undefined
      },

      getSalesForMonth: (month) => {
        const { monthlyData } = get()
        return monthlyData[month]?.sales || []
      },

      assignSaleToCreator: (saleId, creatorId) => {
        const creator = get().getCreator(creatorId)
        if (!creator) return

        get().updateSale(saleId, {
          creatorId,
          creatorName: creator.name,
          isAssigned: true,
        })
      },

      // Payments
      addPayment: (payment) => {
        const newPayment: Payment = {
          ...payment,
          id: `payment-${Date.now()}`,
        }

        set((state) => {
          const month = payment.month
          const monthData = state.monthlyData[month] || { sales: [], payments: [], participations: [] }

          return {
            monthlyData: {
              ...state.monthlyData,
              [month]: {
                ...monthData,
                payments: [...monthData.payments, newPayment],
              },
            },
          }
        })
      },

      updatePayment: (id, updates) => {
        set((state) => {
          const newMonthlyData = { ...state.monthlyData }

          for (const month in newMonthlyData) {
            const monthData = newMonthlyData[month]
            const paymentIndex = monthData.payments.findIndex((payment) => payment.id === id)

            if (paymentIndex !== -1) {
              monthData.payments[paymentIndex] = { ...monthData.payments[paymentIndex], ...updates }
              break
            }
          }

          return { monthlyData: newMonthlyData }
        })
      },

      deletePayment: (id) => {
        set((state) => {
          const newMonthlyData = { ...state.monthlyData }

          for (const month in newMonthlyData) {
            const monthData = newMonthlyData[month]
            monthData.payments = monthData.payments.filter((payment) => payment.id !== id)
          }

          return { monthlyData: newMonthlyData }
        })
      },

      getPayment: (id) => {
        const { monthlyData } = get()

        for (const month in monthlyData) {
          const payment = monthlyData[month].payments.find((payment) => payment.id === id)
          if (payment) return payment
        }

        return undefined
      },

      getPaymentsForMonth: (month) => {
        const { monthlyData } = get()
        return monthlyData[month]?.payments || []
      },

      // Participations
      addParticipation: (participation) => {
        const newParticipation: Participation = {
          ...participation,
          id: `participation-${Date.now()}`,
        }

        set((state) => {
          const month = participation.month
          const monthData = state.monthlyData[month] || { sales: [], payments: [], participations: [] }

          return {
            monthlyData: {
              ...state.monthlyData,
              [month]: {
                ...monthData,
                participations: [...monthData.participations, newParticipation],
              },
            },
          }
        })
      },

      updateParticipation: (id, updates) => {
        set((state) => {
          const newMonthlyData = { ...state.monthlyData }

          for (const month in newMonthlyData) {
            const monthData = newMonthlyData[month]
            const participationIndex = monthData.participations.findIndex((participation) => participation.id === id)

            if (participationIndex !== -1) {
              monthData.participations[participationIndex] = {
                ...monthData.participations[participationIndex],
                ...updates,
              }
              break
            }
          }

          return { monthlyData: newMonthlyData }
        })
      },

      deleteParticipation: (id) => {
        set((state) => {
          const newMonthlyData = { ...state.monthlyData }

          for (const month in newMonthlyData) {
            const monthData = newMonthlyData[month]
            monthData.participations = monthData.participations.filter((participation) => participation.id !== id)
          }

          return { monthlyData: newMonthlyData }
        })
      },

      getParticipation: (id) => {
        const { monthlyData } = get()

        for (const month in monthlyData) {
          const participation = monthlyData[month].participations.find((participation) => participation.id === id)
          if (participation) return participation
        }

        return undefined
      },

      getParticipationsForMonth: (month) => {
        const { monthlyData } = get()
        return monthlyData[month]?.participations || []
      },

      // Import History
      addImportRecord: (record) => {
        const newRecord: ImportHistory = {
          ...record,
          id: `import-${Date.now()}`,
        }
        set((state) => ({
          importHistory: [newRecord, ...state.importHistory],
        }))
      },

      // Users
      addUser: (user) => {
        const newUser: User = {
          ...user,
          id: `user-${Date.now()}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          users: [...state.users, newUser],
        }))
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
        }))
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }))
      },

      getUser: (id) => {
        return get().users.find((user) => user.id === id)
      },

      // Settings
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }))
      },

      // Analytics
      getTotalSales: (month) => {
        const { monthlyData } = get()

        if (month) {
          return monthlyData[month]?.sales.reduce((total, sale) => total + sale.total, 0) || 0
        }

        return Object.values(monthlyData).reduce(
          (total, monthData) => total + monthData.sales.reduce((monthTotal, sale) => monthTotal + sale.total, 0),
          0,
        )
      },

      getTotalCommissions: (month) => {
        const { monthlyData, creators } = get()

        const calculateCommission = (sale: Sale) => {
          if (!sale.creatorId) return 0
          const creator = creators.find((c) => c.id === sale.creatorId)
          return creator ? (sale.total * creator.commission) / 100 : 0
        }

        if (month) {
          return monthlyData[month]?.sales.reduce((total, sale) => total + calculateCommission(sale), 0) || 0
        }

        return Object.values(monthlyData).reduce(
          (total, monthData) =>
            total + monthData.sales.reduce((monthTotal, sale) => monthTotal + calculateCommission(sale), 0),
          0,
        )
      },

      getCreatorStats: (creatorId, month) => {
        const { monthlyData, creators } = get()
        const creator = creators.find((c) => c.id === creatorId)

        if (!creator) {
          return { totalSales: 0, totalCommission: 0, salesCount: 0 }
        }

        const calculateForMonth = (monthData: MonthlyData) => {
          const creatorSales = monthData.sales.filter((sale) => sale.creatorId === creatorId)
          const totalSales = creatorSales.reduce((total, sale) => total + sale.total, 0)
          const totalCommission = (totalSales * creator.commission) / 100

          return {
            totalSales,
            totalCommission,
            salesCount: creatorSales.length,
          }
        }

        if (month) {
          const monthData = monthlyData[month]
          return monthData ? calculateForMonth(monthData) : { totalSales: 0, totalCommission: 0, salesCount: 0 }
        }

        return Object.values(monthlyData).reduce(
          (total, monthData) => {
            const monthStats = calculateForMonth(monthData)
            return {
              totalSales: total.totalSales + monthStats.totalSales,
              totalCommission: total.totalCommission + monthStats.totalCommission,
              salesCount: total.salesCount + monthStats.salesCount,
            }
          },
          { totalSales: 0, totalCommission: 0, salesCount: 0 },
        )
      },

      getTotalPendingSales: () => {
        const { monthlyData } = get()

        return Object.values(monthlyData).reduce(
          (total, monthData) => total + monthData.sales.filter((sale) => !sale.isAssigned).length,
          0,
        )
      },

      getMonthlyRevenue: (month) => {
        const { monthlyData } = get()
        const monthData = monthlyData[month]

        if (!monthData) return 0

        const totalSales = monthData.sales.reduce((total, sale) => total + sale.total, 0)
        const totalCommissions = get().getTotalCommissions(month)

        return totalSales - totalCommissions
      },

      // Utility
      setCurrentMonth: (month) => {
        set({ currentMonth: month })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },

      clearData: () => {
        set({
          creators: [],
          products: [],
          monthlyData: {},
          importHistory: [],
          users: [],
          settings: defaultSettings,
          error: null,
        })
      },
    }),
    {
      name: "boutique-storage",
      partialize: (state) => ({
        creators: state.creators,
        products: state.products,
        monthlyData: state.monthlyData,
        importHistory: state.importHistory,
        users: state.users,
        settings: state.settings,
        currentMonth: state.currentMonth,
      }),
    },
  ),
)
