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
  sku?: string
  lowStockThreshold?: number
}

export interface Sale {
  id: string
  itemName: string
  creator: string
  price: number
  commission: number
  date: string
  isValidated: boolean
  paymentMethod?: string
  originalData?: any
}

export interface Archive {
  id: string
  createur: string
  periode: string
  ventes: Sale[]
  totalCA: number
  totalCommission: number
  netAVerser: number
  statut: "en_attente" | "valide" | "paye"
  dateCreation: string
  validePar?: string
  dateValidation?: string
}

export interface Virement {
  id: string
  archiveId: string
  createur: string
  montant: number
  dateVirement: string
  reference: string
  banque: string
  statut: "programme" | "effectue" | "echec"
  notes: string
  creePar: string
  dateCreation: string
}

export interface Payment {
  id: string
  createur: string
  montant: number
  dateVirement: string
  reference: string
  banque: string
  notes: string
  creePar: string
  dateCreation: string
  ventesPayees: Sale[]
}

export interface MonthlyData {
  creators: Creator[]
  stock: StockItem[]
  sales: Sale[]
  archives: Archive[]
  virements: Virement[]
  payments: Payment[]
  settings: {
    defaultCommission: number
    commissionRate: number
    shopName: string
    logo?: string
    stockTemplate: {
      nameColumn: string
      creatorColumn: string
      priceColumn: string
      quantityColumn: string
      skuColumn: string
      articleColumn: string
    }
    salesTemplate: {
      nameColumn: string
      priceColumn: string
      dateColumn: string
      descriptionColumn: string
      paymentColumn: string
      quantityColumn: string
    }
  }
}

interface StoreState {
  currentMonth: string
  monthlyData: Record<string, MonthlyData>
  isAuthenticated: boolean
  creators: string[]
  salesData: any[]
  stockData: any[]
  archives: Archive[]
  virements: Virement[]
  settings: MonthlyData["settings"]

  // Actions
  setCurrentMonth: (month: string) => void
  getCurrentData: () => MonthlyData
  setAuthenticated: (authenticated: boolean) => void

  // Creators
  addCreator: (name: string) => void
  removeCreator: (name: string) => void
  updateCreator: (id: string, updates: Partial<Creator>) => void
  deleteCreator: (id: string) => void

  // Stock
  setStock: (stock: StockItem[]) => void
  setStockData: (stock: any[]) => void
  addStockItem: (item: Omit<StockItem, "id">) => void
  updateStockItem: (id: string, updates: Partial<StockItem>) => void
  deleteStockItem: (id: string) => void
  getStockForCreator: (creator: string) => any[]

  // Sales
  setSales: (sales: Sale[]) => void
  setSalesData: (sales: any[]) => void
  addSale: (sale: Omit<Sale, "id">) => void
  updateSale: (id: string, updates: Partial<Sale>) => void
  deleteSale: (id: string) => void
  getSalesForCreator: (creator: string) => any[]
  getAllSalesForCreator: (creator: string) => any[]
  getPaidSalesForCreator: (creator: string) => any[]

  // Archives
  createArchive: (creator: string, period: string) => string
  validateArchive: (archiveId: string, validatedBy: string) => void
  getArchivesForCreator: (creator: string) => Archive[]

  // Virements
  addVirement: (virement: Omit<Virement, "id" | "dateCreation">) => void
  updateVirementStatus: (virementId: string, status: Virement["statut"]) => void
  getVirementsForArchive: (archiveId: string) => Virement[]

  // Payments
  payCreatorAndReset: (
    creator: string,
    paymentData: Omit<Payment, "id" | "dateCreation" | "ventesPayees" | "montant">,
  ) => void
  getPaymentsForCreator: (creator: string) => Payment[]

  // Settings
  updateSettings: (settings: Partial<MonthlyData["settings"]>) => void
}

const defaultSettings = {
  defaultCommission: 1.75,
  commissionRate: 1.75,
  shopName: "Petit-Ruban",
  stockTemplate: {
    nameColumn: "Nom",
    creatorColumn: "Créateur",
    priceColumn: "Prix",
    quantityColumn: "Quantité",
    skuColumn: "SKU",
    articleColumn: "Article",
  },
  salesTemplate: {
    nameColumn: "Article",
    priceColumn: "Prix",
    dateColumn: "Date",
    descriptionColumn: "Description",
    paymentColumn: "Paiement",
    quantityColumn: "Quantité",
  },
}

const getDefaultMonthlyData = (): MonthlyData => ({
  creators: [],
  stock: [],
  sales: [],
  archives: [],
  virements: [],
  payments: [],
  settings: defaultSettings,
})

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentMonth: new Date().toISOString().slice(0, 7),
      monthlyData: {},
      isAuthenticated: false,
      creators: [],
      salesData: [],
      stockData: [],
      archives: [],
      virements: [],
      settings: defaultSettings,

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

      addCreator: (name: string) => {
        const { creators } = get()
        if (!creators.includes(name)) {
          set({ creators: [...creators, name] })
        }
      },

      removeCreator: (name: string) => {
        const { creators } = get()
        set({ creators: creators.filter((c) => c !== name) })
      },

      updateCreator: (id: string, updates: Partial<Creator>) => {
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

      deleteCreator: (id: string) => {
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

      setStock: (stock: StockItem[]) => {
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

      setStockData: (stock: any[]) => {
        set({ stockData: stock })
      },

      addStockItem: (item: Omit<StockItem, "id">) => {
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

      updateStockItem: (id: string, updates: Partial<StockItem>) => {
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

      deleteStockItem: (id: string) => {
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

      getStockForCreator: (creator: string) => {
        const { stockData } = get()
        return stockData.filter((item) => item.createur === creator)
      },

      setSales: (sales: Sale[]) => {
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

      setSalesData: (sales: any[]) => {
        set({ salesData: sales })
      },

      addSale: (sale: Omit<Sale, "id">) => {
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

      updateSale: (id: string, updates: Partial<Sale>) => {
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

      deleteSale: (id: string) => {
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

      getSalesForCreator: (creator: string) => {
        const { salesData } = get()
        return salesData.filter((sale) => sale.createur === creator && !sale.paid)
      },

      getAllSalesForCreator: (creator: string) => {
        const { salesData } = get()
        return salesData.filter((sale) => sale.createur === creator)
      },

      getPaidSalesForCreator: (creator: string) => {
        const { salesData } = get()
        return salesData.filter((sale) => sale.createur === creator && sale.paid)
      },

      createArchive: (creator: string, period: string) => {
        const { archives, getSalesForCreator, settings } = get()
        const sales = getSalesForCreator(creator)

        const totalCA = sales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)
        const totalCommission = sales.reduce((sum, sale) => {
          const price = Number.parseFloat(sale.prix || "0")
          const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
          return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
        }, 0)

        const newArchive: Archive = {
          id: Date.now().toString(),
          createur: creator,
          periode: period,
          ventes: sales,
          totalCA,
          totalCommission,
          netAVerser: totalCA - totalCommission,
          statut: "en_attente",
          dateCreation: new Date().toISOString(),
        }

        set({ archives: [...archives, newArchive] })
        return newArchive.id
      },

      validateArchive: (archiveId: string, validatedBy: string) => {
        const { archives } = get()
        set({
          archives: archives.map((archive) =>
            archive.id === archiveId
              ? {
                  ...archive,
                  statut: "valide" as const,
                  validePar: validatedBy,
                  dateValidation: new Date().toISOString(),
                }
              : archive,
          ),
        })
      },

      getArchivesForCreator: (creator: string) => {
        const { archives } = get()
        return archives.filter((archive) => archive.createur === creator)
      },

      addVirement: (virement: Omit<Virement, "id" | "dateCreation">) => {
        const { virements, archives } = get()
        const newVirement: Virement = {
          ...virement,
          id: Date.now().toString(),
          dateCreation: new Date().toISOString(),
        }

        // Mettre à jour le statut de l'archive
        const updatedArchives = archives.map((archive) =>
          archive.id === virement.archiveId ? { ...archive, statut: "paye" as const } : archive,
        )

        set({
          virements: [...virements, newVirement],
          archives: updatedArchives,
        })
      },

      updateVirementStatus: (virementId: string, status: Virement["statut"]) => {
        const { virements } = get()
        set({
          virements: virements.map((virement) =>
            virement.id === virementId ? { ...virement, statut: status } : virement,
          ),
        })
      },

      getVirementsForArchive: (archiveId: string) => {
        const { virements } = get()
        return virements.filter((virement) => virement.archiveId === archiveId)
      },

      payCreatorAndReset: (
        creator: string,
        paymentData: Omit<Payment, "id" | "dateCreation" | "ventesPayees" | "montant">,
      ) => {
        const { getSalesForCreator, salesData, settings } = get()
        const sales = getSalesForCreator(creator)

        const totalSales = sales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)
        const totalCommission = sales.reduce((sum, sale) => {
          const price = Number.parseFloat(sale.prix || "0")
          const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
          return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
        }, 0)

        const newPayment: Payment = {
          ...paymentData,
          id: Date.now().toString(),
          dateCreation: new Date().toISOString(),
          montant: totalSales - totalCommission,
          ventesPayees: sales,
        }

        // Marquer les ventes comme payées
        const updatedSalesData = salesData.map((sale) =>
          sales.some((s) => s.id === sale.id) ? { ...sale, paid: true } : sale,
        )

        const { monthlyData, currentMonth } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        set({
          salesData: updatedSalesData,
          monthlyData: {
            ...monthlyData,
            [currentMonth]: {
              ...currentData,
              payments: [...currentData.payments, newPayment],
            },
          },
        })
      },

      getPaymentsForCreator: (creator: string) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()
        return currentData.payments.filter((payment) => payment.createur === creator)
      },

      updateSettings: (settings: Partial<MonthlyData["settings"]>) => {
        const { currentMonth, monthlyData } = get()
        const currentData = monthlyData[currentMonth] || getDefaultMonthlyData()

        set({
          settings: { ...get().settings, ...settings },
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
