import request from '@/config/axios'

export interface DashboardVO {
  brandStores: BrandStoreVO[]
  salesSummary: SalesSummaryVO
  dishRanking: DishRankItemVO[]
  storeRanking: StoreRankItemVO[]
  hotWords: HotWordVO[]
}

export interface BrandStoreVO {
  brandId: number
  brandName: string
  category: string
  storeId: number
  storeName: string
  storeCode: string
  province: string
  city: string
  district: string
  address: string
  phone: string
  businessHours: string
  areaSize: number
  seatCount: number
  openDate: string
  supportDineIn: boolean
  supportTakeout: boolean
  supportPickup: boolean
}

export interface SalesSummaryVO {
  todayOrderCount: number
  todaySales: number
  monthOrderCount: number
  monthSales: number
  totalStores: number
  activeStores: number
}

export interface DishRankItemVO {
  dishName: string
  quantity: number
  amount: number
  storeId: number
  storeName: string
}

export interface StoreRankItemVO {
  storeId: number
  storeName: string
  orderCount: number
  totalSales: number
}

export interface HotWordVO {
  word: string
  heat: number
  sourceType: string
}

export const getDashboard = async (): Promise<DashboardVO> => {
  return await request.get({ url: '/restaurant/dashboard/data' })
}
