import request from '@/config/axios'

export interface AddonVO {
  id?: number
  brandId?: number
  groupName: string
  name: string
  extraPrice?: number
  isRequired?: boolean
  isMulti?: boolean
  sort?: number
  status?: number
}

export const getAddonPage = async (params: any) => {
  return await request.get({ url: '/restaurant/dish-addon/page', params })
}

export const getAddon = async (id: number) => {
  return await request.get({ url: '/restaurant/dish-addon/get?id=' + id })
}

export const getAddonListByBrand = async (brandId: number) => {
  return await request.get({ url: '/restaurant/dish-addon/list-by-brand?brandId=' + brandId })
}

export const createAddon = async (data: AddonVO) => {
  return await request.post({ url: '/restaurant/dish-addon/create', data })
}

export const updateAddon = async (data: AddonVO) => {
  return await request.put({ url: '/restaurant/dish-addon/update', data })
}

export const deleteAddon = async (id: number) => {
  return await request.delete({ url: '/restaurant/dish-addon/delete?id=' + id })
}
