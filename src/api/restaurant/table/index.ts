import request from '@/config/axios'

export interface TableVO {
  id: number
  storeId: number
  area: string
  tableNo: string
  seatCapacity: number
  status: number
  qrCode: string
  currentOrderId: number
  tenantId: number
  createTime: string
}

export const getTablePage = async (params: any) => {
  return await request.get({ url: '/restaurant/table/page', params })
}

export const getTable = async (id: number) => {
  return await request.get({ url: '/restaurant/table/get?id=' + id })
}

export const getSimpleTableList = async () => {
  return await request.get({ url: '/restaurant/table/list-all-simple' })
}

export const createTable = async (data: TableVO) => {
  return await request.post({ url: '/restaurant/table/create', data })
}

export const updateTable = async (data: TableVO) => {
  return await request.put({ url: '/restaurant/table/update', data })
}

export const deleteTable = async (id: number) => {
  return await request.delete({ url: '/restaurant/table/delete?id=' + id })
}

export const batchCreateTable = async (data: any) => {
  return await request.post({ url: '/restaurant/table/batch-create', data })
}
