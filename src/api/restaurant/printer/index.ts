import request from '@/config/axios'

export interface PrinterVO {
  id?: number
  name: string
  type: number
  provider: string
  deviceNo: string
  deviceKey: string
  storeId?: number
  status: number
}

export const getPrinterPage = async (params: any) => {
  return await request.get({ url: '/restaurant/printer/page', params })
}

export const getPrinter = async (id: number) => {
  return await request.get({ url: '/restaurant/printer/get?id=' + id })
}

export const createPrinter = async (data: PrinterVO) => {
  return await request.post({ url: '/restaurant/printer/create', data })
}

export const updatePrinter = async (data: PrinterVO) => {
  return await request.put({ url: '/restaurant/printer/update', data })
}

export const deletePrinter = async (id: number) => {
  return await request.delete({ url: '/restaurant/printer/delete?id=' + id })
}
