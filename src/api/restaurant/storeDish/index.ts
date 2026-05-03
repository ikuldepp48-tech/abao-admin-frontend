import request from '@/config/axios'

export interface StoreDishVO {
  id?: number
  storeId: number
  spuId: number
  isAvailable?: boolean
  dailyLimit?: number
  isSoldOut?: boolean
  todaySold?: number
  price?: number
  sort?: number
  status?: number
}

export const getStoreDishPage = async (params: any) => {
  return await request.get({ url: '/restaurant/store-dish/page', params })
}

export const overridePrice = async (id: number, price: number) => {
  return await request.put({ url: '/restaurant/store-dish/override-price', params: { id, price } })
}

export const setDailyLimit = async (id: number, dailyLimit: number) => {
  return await request.put({ url: '/restaurant/store-dish/set-daily-limit', params: { id, dailyLimit } })
}

export const batchSoldOut = async (ids: number[]) => {
  return await request.put({ url: '/restaurant/store-dish/batch-sold-out', params: { ids: ids.join(',') } })
}

export const batchRestore = async (ids: number[]) => {
  return await request.put({ url: '/restaurant/store-dish/batch-restore', params: { ids: ids.join(',') } })
}
