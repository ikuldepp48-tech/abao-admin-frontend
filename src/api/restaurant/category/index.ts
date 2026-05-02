import request from '@/config/axios'

export interface CategoryVO {
  id: number
  name: string
  parentId: number
  sort: number
  status: number
  tenantId: number
  createTime: string
}

export const getCategoryPage = async (params: any) => {
  return await request.get({ url: '/restaurant/category/page', params })
}

export const getCategory = async (id: number) => {
  return await request.get({ url: '/restaurant/category/get?id=' + id })
}

export const getSimpleCategoryList = async () => {
  return await request.get({ url: '/restaurant/category/list-all-simple' })
}

export const createCategory = async (data: CategoryVO) => {
  return await request.post({ url: '/restaurant/category/create', data })
}

export const updateCategory = async (data: CategoryVO) => {
  return await request.put({ url: '/restaurant/category/update', data })
}

export const deleteCategory = async (id: number) => {
  return await request.delete({ url: '/restaurant/category/delete?id=' + id })
}
