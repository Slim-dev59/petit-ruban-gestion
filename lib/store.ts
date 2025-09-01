import { create } from "zustand"
import { persist } from "zustand/middleware"

// Types pour les données
export interface SaleData {
  id: string
  date: string
  description: string
  prix: string
  paiement: string
  createur: string
  identified: boolean
  month: string // Format YYYY-MM
}

export interface StockData {
  id: string
  article: string
  price: string
  quantity: string
  sku: string
  createur: string
  lowStockThreshold: string
  month: string // Format YYYY-MM
}

export interface Archive {
  id: string
  createur: string
  periode: string // Format YYYY-MM
  dateCreation: string
  statut: "en_attente" | "valide" | "paye"
  ventes: SaleData[]
  totalCA: number
  totalCommission: number
  netAVerser: number
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
  ventesPayees: SaleData[]
}

export interface Settings {
  commissionRate: number
  shopName: string
  autoApplyCommission: boolean
  logo?: string
  stockTemplate: {
    creatorColumn: string
    articleColumn: string
    priceColumn: string
    quantityColumn: string
    skuColumn: string
  }
  salesTemplate: {
    descriptionColumn: string
    priceColumn: string
    paymentColumn: string
    dateColumn: string
  }
}

interface StoreState {
  // Données par mois
  salesData: SaleData[]
  stockData: StockData[]
  creators: string[]

  // Mois sélectionné
  selectedMonth: string

  // Archives et paiements
  archives: Archive[]
  virements: Virement[]
  payments: Payment[]

  // Paramètres
  settings: Settings

  // État d'authentification
  isAuthenticated: boolean
  setAuthenticated: (authenticated: boolean) => void

  // Actions pour les créateurs
  addCreator: (name: string) => void
  removeCreator: (name: string) => void
  removeAllCreators: () => void

  // Actions pour les données
  setSalesData: (data: SaleData[]) => void
  setStockData: (data: StockData[]) => void
  updateSaleCreator: (saleId: string, newCreator: string) => void

  // Actions pour les mois
  setSelectedMonth: (month: string) => void
  getAvailableMonths: () => string[]

  // Actions pour les archives
  createArchive: (createur: string, periode: string) => string
  validateArchive: (archiveId: string, validePar: string) => void

  // Actions pour les virements
  addVirement: (virement: Omit<Virement, "id" | "dateCreation">) => void
  updateVirementStatus: (virementId: string, statut: Virement["statut"]) => void

  // Actions pour les paiements
  payCreatorAndReset: (createur: string, paymentData: Omit<Payment, "id" | "dateCreation" | "ventesPayees">) => void

  // Getters
  getSalesForCreator: (createur: string) => SaleData[]
  getAllSalesForCreator: (createur: string) => SaleData[]
  getPaidSalesForCreator: (createur: string) => SaleData[]
  getStockForCreator: (createur: string) => StockData[]
  getArchivesForCreator: (createur: string) => Archive[]
  getVirementsForArchive: (archiveId: string) => Virement[]
  getPaymentsForCreator: (createur: string) => Payment[]

  // Actions pour les paramètres
  updateSettings: (updates: Partial<Settings>) => void

  // Actions de nettoyage
  resetAllData: () => void
  clearStockData: () => void
  clearSalesData: () => void
}

const defaultSettings: Settings = {
  commissionRate: 1.75,
  shopName: "Ma Boutique Multi-Créateurs",
  autoApplyCommission: true,
  stockTemplate: {
    creatorColumn: "Item name",
    articleColumn: "Variations",
    priceColumn: "Price",
    quantityColumn: "Quantity",
    skuColumn: "SKU",
  },
  salesTemplate: {
    descriptionColumn: "Description",
    priceColumn: "Price",
    paymentColumn: "Payment method",
    dateColumn: "Date",
  },
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      salesData: [],
      stockData: [],
      creators: [],
      selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
      archives: [],
      virements: [],
      payments: [],
      settings: defaultSettings,
      isAuthenticated: false,

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
        const { creators, salesData, stockData } = get()
        set({
          creators: creators.filter((c) => c !== name),
          salesData: salesData.filter((s) => s.createur !== name),
          stockData: stockData.filter((s) => s.createur !== name),
        })
      },

      removeAllCreators: () => {
        set({ creators: [] })
      },

      setSalesData: (data: SaleData[]) => {
        const { selectedMonth } = get()
        const monthData = data.map((sale) => ({ ...sale, month: selectedMonth }))
        const otherMonthsData = get().salesData.filter((s) => s.month !== selectedMonth)
        set({ salesData: [...otherMonthsData, ...monthData] })
      },

      setStockData: (data: StockData[]) => {
        const { selectedMonth } = get()
        const monthData = data.map((stock) => ({ ...stock, month: selectedMonth }))
        const otherMonthsData = get().stockData.filter((s) => s.month !== selectedMonth)
        set({ stockData: [...otherMonthsData, ...monthData] })
      },

      updateSaleCreator: (saleId: string, newCreator: string) => {
        const { salesData } = get()
        const updatedSales = salesData.map((sale) =>
          sale.id === saleId ? { ...sale, createur: newCreator, identified: true } : sale,
        )
        set({ salesData: updatedSales })
      },

      setSelectedMonth: (month: string) => {
        set({ selectedMonth: month })
      },

      getAvailableMonths: () => {
        const { salesData, stockData } = get()
        const months = new Set<string>()

        salesData.forEach((sale) => months.add(sale.month))
        stockData.forEach((stock) => months.add(stock.month))

        return Array.from(months).sort().reverse()
      },

      createArchive: (createur: string, periode: string) => {
        const { salesData, settings } = get()
        const creatorSales = salesData.filter(
          (sale) => sale.createur === createur && sale.month === periode && sale.identified,
        )

        const totalCA = creatorSales.reduce((sum, sale) => {
          const price = Number.parseFloat(sale.prix?.replace(",", ".") || "0")
          return sum + (isNaN(price) ? 0 : price)
        }, 0)

        const totalCommission = creatorSales.reduce((sum, sale) => {
          const price = Number.parseFloat(sale.prix?.replace(",", ".") || "0")
          if (isNaN(price)) return sum

          const isNotCash =
            sale.paiement?.toLowerCase() !== "espèces" &&
            sale.paiement?.toLowerCase() !== "cash" &&
            sale.paiement?.toLowerCase() !== "liquide"
          return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
        }, 0)

        const archive: Archive = {
          id: Date.now().toString(),
          createur,
          periode,
          dateCreation: new Date().toISOString(),
          statut: "en_attente",
          ventes: creatorSales,
          totalCA,
          totalCommission,
          netAVerser: totalCA - totalCommission,
        }

        set((state) => ({ archives: [...state.archives, archive] }))
        return archive.id
      },

      validateArchive: (archiveId: string, validePar: string) => {
        const { archives } = get()
        const updatedArchives = archives.map((archive) =>
          archive.id === archiveId
            ? {
                ...archive,
                statut: "valide" as const,
                validePar,
                dateValidation: new Date().toISOString(),
              }
            : archive,
        )
        set({ archives: updatedArchives })
      },

      addVirement: (virementData) => {
        const virement: Virement = {
          ...virementData,
          id: Date.now().toString(),
          dateCreation: new Date().toISOString(),
        }
        set((state) => ({ virements: [...state.virements, virement] }))
      },

      updateVirementStatus: (virementId: string, statut: Virement["statut"]) => {
        const { virements } = get()
        const updatedVirements = virements.map((v) => (v.id === virementId ? { ...v, statut } : v))
        set({ virements: updatedVirements })
      },

      payCreatorAndReset: (createur: string, paymentData) => {
        const { salesData, selectedMonth } = get()
        const creatorSales = salesData.filter(
          (sale) => sale.createur === createur && sale.month === selectedMonth && sale.identified,
        )

        const totalAmount = creatorSales.reduce((sum, sale) => {
          const price = Number.parseFloat(sale.prix?.replace(",", ".") || "0")
          return sum + (isNaN(price) ? 0 : price)
        }, 0)

        const payment: Payment = {
          ...paymentData,
          id: Date.now().toString(),
          dateCreation: new Date().toISOString(),
          montant: totalAmount,
          ventesPayees: creatorSales,
        }

        // Supprimer les ventes payées des ventes actives
        const remainingSales = salesData.filter(
          (sale) => !(sale.createur === createur && sale.month === selectedMonth && sale.identified),
        )

        set((state) => ({
          payments: [...state.payments, payment],
          salesData: remainingSales,
        }))
      },

      getSalesForCreator: (createur: string) => {
        const { salesData, selectedMonth } = get()
        return salesData.filter((sale) => sale.createur === createur && sale.month === selectedMonth)
      },

      getAllSalesForCreator: (createur: string) => {
        const { salesData, payments } = get()
        const activeSales = salesData.filter((sale) => sale.createur === createur)
        const paidSales = payments
          .filter((payment) => payment.createur === createur)
          .flatMap((payment) => payment.ventesPayees)

        return [...activeSales, ...paidSales]
      },

      getPaidSalesForCreator: (createur: string) => {
        const { payments } = get()
        return payments.filter((payment) => payment.createur === createur).flatMap((payment) => payment.ventesPayees)
      },

      getStockForCreator: (createur: string) => {
        const { stockData, selectedMonth } = get()
        return stockData.filter((stock) => stock.createur === createur && stock.month === selectedMonth)
      },

      getArchivesForCreator: (createur: string) => {
        const { archives } = get()
        return archives.filter((archive) => archive.createur === createur)
      },

      getVirementsForArchive: (archiveId: string) => {
        const { virements } = get()
        return virements.filter((virement) => virement.archiveId === archiveId)
      },

      getPaymentsForCreator: (createur: string) => {
        const { payments } = get()
        return payments.filter((payment) => payment.createur === createur)
      },

      updateSettings: (updates: Partial<Settings>) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }))
      },

      resetAllData: () => {
        set({
          salesData: [],
          stockData: [],
          creators: [],
          archives: [],
          virements: [],
          payments: [],
          settings: defaultSettings,
        })
      },

      clearStockData: () => {
        const { stockData, selectedMonth } = get()
        const otherMonthsData = stockData.filter((s) => s.month !== selectedMonth)
        set({ stockData: otherMonthsData })
      },

      clearSalesData: () => {
        const { salesData, selectedMonth } = get()
        const otherMonthsData = salesData.filter((s) => s.month !== selectedMonth)
        set({ salesData: otherMonthsData })
      },
    }),
    {
      name: "boutique-storage",
    },
  ),
)
