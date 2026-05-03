import request from '@/config/axios'

export interface SkuVO {
  id?: number
  spuId?: number
  name: string
  properties?: string
  price: number
  memberPrice?: number
  costPrice?: number
  weight?: number
  barcode?: string
  picture?: string
  sort?: number
  status?: number
}

export interface DishVO {
  id: number
  categoryId: number
  name: string
  price: number
  image: string
  description: string
  isSignature: boolean
  isNew: boolean
  sort: number
  status: number
  tenantId: number
  createTime: string
  minPrice?: number
  maxPrice?: number
  skus?: SkuVO[]
  addonGroupNames?: string[]
}

export const getDishPage = async (params: any) => {
  return await request.get({ url: '/restaurant/dish-spu/page', params })
}

export const getDish = async (id: number) => {
  return await request.get({ url: '/restaurant/dish-spu/get?id=' + id })
}

export const getSimpleDishList = async () => {
  return await request.get({ url: '/restaurant/dish-spu/list-all-simple' })
}

export const createDish = async (data: DishVO) => {
  return await request.post({ url: '/restaurant/dish-spu/create', data })
}

export const updateDish = async (data: DishVO) => {
  return await request.put({ url: '/restaurant/dish-spu/update', data })
}

export const deleteDish = async (id: number) => {
  return await request.delete({ url: '/restaurant/dish-spu/delete?id=' + id })
}
