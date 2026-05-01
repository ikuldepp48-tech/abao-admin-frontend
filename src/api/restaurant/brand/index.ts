import request from '@/config/axios'

export interface BrandVO {
  id: number
  name: string
  code: string
  logo: string
  description: string
  category: string
  status: number
  tenantId: number
  createTime: string
}

export const getBrandPage = async (params: any) => {
  return await request.get({ url: '/restaurant/brand/page', params })
}

export const getBrand = async (id: number) => {
  return await request.get({ url: '/restaurant/brand/get?id=' + id })
}

export const getSimpleBrandList = async () => {
  return await request.get({ url: '/restaurant/brand/list-all-simple' })
}

export const createBrand = async (data: BrandVO) => {
  return await request.post({ url: '/restaurant/brand/create', data })
}

export const updateBrand = async (data: BrandVO) => {
  return await request.put({ url: '/restaurant/brand/update', data })
}

export const deleteBrand = async (id: number) => {
  return await request.delete({ url: '/restaurant/brand/delete?id=' + id })
}
