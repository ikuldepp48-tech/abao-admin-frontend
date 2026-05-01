import request from '@/config/axios'

export interface StoreVO {
  id: number
  brandId: number
  name: string
  code: string
  type: number
  parentStoreId: number
  province: string
  city: string
  district: string
  address: string
  longitude: number
  latitude: number
  phone: string
  managerUserId: number
  businessHours: string
  status: number
  areaSize: number
  seatCount: number
  tenantId: number
  createTime: string
}

export const getStorePage = async (params: any) => {
  return await request.get({ url: '/restaurant/store/page', params })
}

export const getStore = async (id: number) => {
  return await request.get({ url: '/restaurant/store/get?id=' + id })
}

export const getSimpleStoreList = async () => {
  return await request.get({ url: '/restaurant/store/list-all-simple' })
}

export const createStore = async (data: StoreVO) => {
  return await request.post({ url: '/restaurant/store/create', data })
}

export const updateStore = async (data: StoreVO) => {
  return await request.put({ url: '/restaurant/store/update', data })
}

export const deleteStore = async (id: number) => {
  return await request.delete({ url: '/restaurant/store/delete?id=' + id })
}
