import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Creator {
  id: string
  name: string
  email: string
  phone: string
  commission: number
  isActive: boolean
  createdAt: string
}

export interface Product {
  id: string
  name: string
  price: number
  creatorId: string
  category: string
  stock: number
  isActive: boolean
  createdAt: string
}

export interface Sale {
  id: string
  productId: string
  creatorId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  date: string
  paymentMethod: string
  status: string
}

export interface Payment {
  id: string
  creatorId: string
  amount: number
  date: string
  status: string
  method: string
  reference: string
}

export interface User {
  id: string
  username: string
  email: string
  role: string
  isActive: boolean
  lastLogin: string
}

export interface Settings {
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  defaultCommission: number
  currency: string
  taxRate: number
  sumupClientId?: string
  sumupClientSecret?: string
  sumupAccessToken?: string
  sumupRefreshToken?: string
  sumupLastSync?: string
  sumupAutoSync?: boolean
  sumupSyncInterval?: number
}

interface Store {
  // Data
  creators: Creator[]
  products: Product[]
  sales: Sale[]
  payments: Payment[]
  users: User[]
  settings: Settings

  // Auth
  currentUser: User | null
  isAuthenticated: boolean

  // UI State
  isLoading: boolean
  error: string | null

  // Actions
  setCreators: (creators: Creator[]) => void
  addCreator: (creator: Creator) => void
  updateCreator: (id: string, creator: Partial<Creator>) => void
  deleteCreator: (id: string) => void

  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void

  setSales: (sales: Sale[]) => void
  addSale: (sale: Sale) => void
  updateSale: (id: string, sale: Partial<Sale>) => void
  deleteSale: (id: string) => void

  setPayments: (payments: Payment[]) => void
  addPayment: (payment: Payment) => void
  updatePayment: (id: string, payment: Partial<Payment>) => void
  deletePayment: (id: string) => void

  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void

  updateSettings: (settings: Partial<Settings>) => void

  // Auth actions
  login: (user: User) => void
  logout: () => void

  // UI actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      creators: [],
      products: [],
      sales: [],
      payments: [],
      users: [
        {
          id: "1",
          username: "admin",
          email: "admin@petit-ruban.fr",
          role: "admin",
          isActive: true,
          lastLogin: new Date().toISOString(),
        },
        {
          id: "2",
          username: "setup",
          email: "setup@petit-ruban.fr",
          role: "setup",
          isActive: true,
          lastLogin: new Date().toISOString(),
        },
        {
          id: "3",
          username: "demo",
          email: "demo@petit-ruban.fr",
          role: "demo",
          isActive: true,
          lastLogin: new Date().toISOString(),
        },
      ],
      settings: {
        companyName: "Le Petit Ruban",
        companyAddress: "123 Rue de la Créativité, 75001 Paris",
        companyPhone: "01 23 45 67 89",
        companyEmail: "contact@petit-ruban.fr",
        defaultCommission: 30,
        currency: "EUR",
        taxRate: 20,
        sumupClientId: "",
        sumupClientSecret: "",
        sumupAccessToken: "",
        sumupRefreshToken: "",
        sumupLastSync: "",
        sumupAutoSync: false,
        sumupSyncInterval: 60,
      },

      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setCreators: (creators) => set({ creators }),
      addCreator: (creator) => set((state) => ({ creators: [...state.creators, creator] })),
      updateCreator: (id, creator) =>
        set((state) => ({
          creators: state.creators.map((c) => (c.id === id ? { ...c, ...creator } : c)),
        })),
      deleteCreator: (id) => set((state) => ({ creators: state.creators.filter((c) => c.id !== id) })),

      setProducts: (products) => set({ products }),
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, product) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...product } : p)),
        })),
      deleteProduct: (id) => set((state) => ({ products: state.products.filter((p) => p.id !== id) })),

      setSales: (sales) => set({ sales }),
      addSale: (sale) => set((state) => ({ sales: [...state.sales, sale] })),
      updateSale: (id, sale) =>
        set((state) => ({
          sales: state.sales.map((s) => (s.id === id ? { ...s, ...sale } : s)),
        })),
      deleteSale: (id) => set((state) => ({ sales: state.sales.filter((s) => s.id !== id) })),

      setPayments: (payments) => set({ payments }),
      addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
      updatePayment: (id, payment) =>
        set((state) => ({
          payments: state.payments.map((p) => (p.id === id ? { ...p, ...payment } : p)),
        })),
      deletePayment: (id) => set((state) => ({ payments: state.payments.filter((p) => p.id !== id) })),

      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, user) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...user } : u)),
        })),
      deleteUser: (id) => set((state) => ({ users: state.users.filter((u) => u.id !== id) })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Auth actions
      login: (user) => set({ currentUser: user, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),

      // UI actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "boutique-storage",
      partialize: (state) => ({
        creators: state.creators,
        products: state.products,
        sales: state.sales,
        payments: state.payments,
        users: state.users,
        settings: state.settings,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
