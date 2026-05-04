import request from '@/config/axios'

export interface OrderItemVO {
  id: number
  orderId: number
  spuId: number
  spuName: string
  skuId: number
  skuName: string
  unitPrice: number
  quantity: number
  addonsJson: string
  customerRemark: string
  subtotal: number
  kdsStatus: number
}

export interface OrderGroupVO {
  orderId: number
  orderNo: string
  createTime: string
  items: OrderItemVO[]
}

// 获取档口订单列表
export const getOrderList = async (stationId: number) => {
  return await request.get({ url: '/restaurant/kds/order-list', params: { stationId } })
}

// 开始制作
export const startItem = async (itemId: number) => {
  return await request.put({ url: '/restaurant/kds/start', params: { itemId } })
}

// 完成出餐
export const finishItem = async (itemId: number) => {
  return await request.put({ url: '/restaurant/kds/finish', params: { itemId } })
}
