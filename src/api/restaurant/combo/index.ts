import request from '@/config/axios'

export interface ComboItemVO {
  id?: number
  spuId: number
  skuId?: number
  quantity: number
  extraPrice?: number
  isRequired?: boolean
  replaceableSpuIds?: string
  sort?: number
}

export interface ComboVO {
  id?: number
  brandId: number
  name: string
  image?: string
  description?: string
  comboPrice: number
  originalPrice?: number
  sort?: number
  status?: number
  validForDineIn?: boolean
  validForTakeout?: boolean
  items?: ComboItemVO[]
}

export const getComboPage = async (params: any) => {
  return await request.get({ url: '/restaurant/combo/page', params })
}

export const getCombo = async (id: number) => {
  return await request.get({ url: '/restaurant/combo/get?id=' + id })
}

export const getComboListByBrand = async (brandId: number) => {
  return await request.get({ url: '/restaurant/combo/list-by-brand?brandId=' + brandId })
}

export const createCombo = async (data: ComboVO) => {
  return await request.post({ url: '/restaurant/combo/create', data })
}

export const updateCombo = async (data: ComboVO) => {
  return await request.put({ url: '/restaurant/combo/update', data })
}

export const deleteCombo = async (id: number) => {
  return await request.delete({ url: '/restaurant/combo/delete?id=' + id })
}
