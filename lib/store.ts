"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

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
}

export interface Sale {
  id: string
  productId: string
  creatorId: string
  quantity: number
  unitPrice: number
  totalAmount: number
  commission: number
  date: string
  paymentMethod?: string
  status: "pending" | "paid" | "cancelled"
  notes?: string
}

export interface Payment {
  id: string
  creatorId: string
  amount: number
  date: string
  method: "cash" | "transfer" | "check"
  status: "pending" | "completed" | "failed"
  reference?: string
  notes?: string
}

export interface Settings {
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  defaultCommission: number
  currency: string
  taxRate: number

  // SumUp Integration
  sumupClientId?: string
  sumupClientSecret?: string
  sumupAccessToken?: string
  sumupRefreshToken?: string
  sumupLastSync?: string
  sumupAutoSync?: boolean
  sumupSyncInterval?: number

  // Email settings
  emailHost?: string
  emailPort?: number
  emailUser?: string
  emailPassword?: string

  // Other settings
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
}

interface StoreState {
  // Data
  creators: Creator[]
  products: Product[]
  sales: Sale[]
  payments: Payment[]
  settings: Settings

  // UI State
  isLoading: boolean
  error: string | null

  // Actions - Creators
  addCreator: (creator: Omit<Creator, "id" | "createdAt">) => void
  updateCreator: (id: string, updates: Partial<Creator>) => void
  deleteCreator: (id: string) => void
  getCreator: (id: string) => Creator | undefined

  // Actions - Products
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined

  // Actions - Sales
  addSale: (sale: Omit<Sale, "id">) => void
  updateSale: (id: string, updates: Partial<Sale>) => void
  deleteSale: (id: string) => void
  getSale: (id: string) => Sale | undefined
  getSalesByCreator: (creatorId: string) => Sale[]

  // Actions - Payments
  addPayment: (payment: Omit<Payment, "id">) => void
  updatePayment: (id: string, updates: Partial<Payment>) => void
  deletePayment: (id: string) => void
  getPayment: (id: string) => Payment | undefined
  getPaymentsByCreator: (creatorId: string) => Payment[]

  // Actions - Settings
  updateSettings: (updates: Partial<Settings>) => void

  // Actions - Utility
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // Analytics
  getCreatorStats: (creatorId: string) => {
    totalSales: number
    totalCommission: number
    pendingCommission: number
    salesCount: number
  }

  getTotalStats: () => {
    totalSales: number
    totalCommissions: number
    pendingCommissions: number
    activeCreators: number
    totalProducts: number
  }
}

const defaultSettings: Settings = {
  companyName: "Le Petit Ruban",
  companyEmail: "contact@petit-ruban.fr",
  companyPhone: "+33 1 23 45 67 89",
  companyAddress: "123 Rue de la Créativité, 75001 Paris",
  defaultCommission: 15,
  currency: "EUR",
  taxRate: 20,
  theme: "light",
  language: "fr",
  timezone: "Europe/Paris",
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      creators: [],
      products: [],
      sales: [],
      payments: [],
      settings: defaultSettings,
      isLoading: false,
      error: null,

      // Creator actions
      addCreator: (creatorData) => {
        const creator: Creator = {
          ...creatorData,
          id: `creator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          creators: [...state.creators, creator],
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

      // Product actions
      addProduct: (productData) => {
        const product: Product = {
          ...productData,
          id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          products: [...state.products, product],
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

      // Sale actions
      addSale: (saleData) => {
        const sale: Sale = {
          ...saleData,
          id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }

        set((state) => ({
          sales: [...state.sales, sale],
        }))
      },

      updateSale: (id, updates) => {
        set((state) => ({
          sales: state.sales.map((sale) => (sale.id === id ? { ...sale, ...updates } : sale)),
        }))
      },

      deleteSale: (id) => {
        set((state) => ({
          sales: state.sales.filter((sale) => sale.id !== id),
        }))
      },

      getSale: (id) => {
        return get().sales.find((sale) => sale.id === id)
      },

      getSalesByCreator: (creatorId) => {
        return get().sales.filter((sale) => sale.creatorId === creatorId)
      },

      // Payment actions
      addPayment: (paymentData) => {
        const payment: Payment = {
          ...paymentData,
          id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }

        set((state) => ({
          payments: [...state.payments, payment],
        }))
      },

      updatePayment: (id, updates) => {
        set((state) => ({
          payments: state.payments.map((payment) => (payment.id === id ? { ...payment, ...updates } : payment)),
        }))
      },

      deletePayment: (id) => {
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id),
        }))
      },

      getPayment: (id) => {
        return get().payments.find((payment) => payment.id === id)
      },

      getPaymentsByCreator: (creatorId) => {
        return get().payments.filter((payment) => payment.creatorId === creatorId)
      },

      // Settings actions
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }))
      },

      // Utility actions
      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      // Analytics
      getCreatorStats: (creatorId) => {
        const { sales, payments } = get()
        const creatorSales = sales.filter((sale) => sale.creatorId === creatorId)
        const creatorPayments = payments.filter((payment) => payment.creatorId === creatorId)

        const totalSales = creatorSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
        const totalCommission = creatorSales.reduce((sum, sale) => sum + sale.commission, 0)
        const paidCommissions = creatorPayments
          .filter((payment) => payment.status === "completed")
          .reduce((sum, payment) => sum + payment.amount, 0)
        const pendingCommission = totalCommission - paidCommissions

        return {
          totalSales,
          totalCommission,
          pendingCommission,
          salesCount: creatorSales.length,
        }
      },

      getTotalStats: () => {
        const { creators, products, sales, payments } = get()

        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
        const totalCommissions = sales.reduce((sum, sale) => sum + sale.commission, 0)
        const paidCommissions = payments
          .filter((payment) => payment.status === "completed")
          .reduce((sum, payment) => sum + payment.amount, 0)
        const pendingCommissions = totalCommissions - paidCommissions

        return {
          totalSales,
          totalCommissions,
          pendingCommissions,
          activeCreators: creators.filter((creator) => creator.isActive).length,
          totalProducts: products.filter((product) => product.isActive).length,
        }
      },
    }),
    {
      name: "petit-ruban-store",
      partialize: (state) => ({
        creators: state.creators,
        products: state.products,
        sales: state.sales,
        payments: state.payments,
        settings: state.settings,
      }),
    },
  ),
)
