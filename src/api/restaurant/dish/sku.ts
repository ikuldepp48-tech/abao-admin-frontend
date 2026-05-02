import request from '@/config/axios'

export interface SkuVO {
  id: number
  spuId: number
  name: string
  properties?: string
  price: number
  memberPrice?: number
  costPrice?: number
  weight?: number
  barcode?: string
  picture?: string
  sort: number
  status: number
  tenantId: number
  createTime: string
}

export const getSkuPage = async (params: any) => {
  return await request.get({ url: '/restaurant/dish-sku/page', params })
}

export const getSkuListBySpuId = async (spuId: number) => {
  return await request.get({ url: '/restaurant/dish-sku/list-by-spu?spuId=' + spuId })
}

export const getSku = async (id: number) => {
  return await request.get({ url: '/restaurant/dish-sku/get?id=' + id })
}

export const createSku = async (data: any) => {
  return await request.post({ url: '/restaurant/dish-sku/create', data })
}

export const updateSku = async (data: any) => {
  return await request.put({ url: '/restaurant/dish-sku/update', data })
}

export const deleteSku = async (id: number) => {
  return await request.delete({ url: '/restaurant/dish-sku/delete?id=' + id })
}
