import request from '@/config/axios'

export interface OrderVO {
  id?: number
  orderNo?: string
  memberId?: number
  storeId?: number
  tableId?: number
  orderType?: number
  dinerCount?: number
  status?: number
  payStatus?: number
  originalAmount?: number
  discountAmount?: number
  payAmount?: number
  remark?: string
  clientOrderNo?: string
  createTime?: string
  updateTime?: string
}

// 获取订单分页列表
export const getOrderPage = async (params: any) => {
  return await request.get({ url: '/restaurant/order/admin/page', params })
}

// 获取订单详情
export const getOrderDetail = async (id: number) => {
  return await request.get({ url: '/restaurant/order/admin/get?id=' + id })
}
