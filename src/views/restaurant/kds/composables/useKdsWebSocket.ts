import { ref, onUnmounted } from 'vue'
import { Client } from '@stomp/stompjs'

interface OrderItemData {
  itemId: number
  spuName: string
  skuName: string
  quantity: number
  kdsStatus: number
  addonsDesc: string
  customerRemark: string
  unitPrice: number
  subtotal: number
}

interface OrderData {
  orderId: number
  orderNo?: string
  createTime?: string
  items: OrderItemData[]
}

interface KdsMessage {
  type: string
  data: OrderData
}

export function useKdsWebSocket(stationId: number) {
  const orders = ref<Map<number, OrderData>>(new Map())
  const connected = ref(false)
  const reconnectCount = ref(0)
  const maxReconnect = 5

  const client = new Client({
    brokerURL: `ws://localhost:48090/ws/kds`,
    reconnectDelay: 3000,
    onConnect: () => {
      connected.value = true
      reconnectCount.value = 0
      // 订阅该档口的 topic
      client.subscribe(`/topic/kds/station/${stationId}`, (message) => {
        try {
          const msg: KdsMessage = JSON.parse(message.body)
          if (msg.type === 'NEW_ORDER') {
            // 新订单加入列表
            orders.value.set(msg.data.orderId, msg.data)
          } else if (msg.type === 'STATUS_UPDATE') {
            // 更新订单项状态
            const existing = orders.value.get(msg.data.orderId)
            if (existing && msg.data.items) {
              for (const updateItem of msg.data.items) {
                const item = existing.items.find(i => i.itemId === updateItem.itemId)
                if (item) {
                  item.kdsStatus = updateItem.kdsStatus
                }
              }
              // 如果所有 item 都是已出餐(2)，从列表中移除
              if (existing.items.every(i => i.kdsStatus === 2)) {
                setTimeout(() => {
                  orders.value.delete(msg.data.orderId)
                }, 3000)
              }
            }
          }
          // 触发响应式更新
          orders.value = new Map(orders.value)
        } catch (e) {
          console.error('[KDS] 消息解析失败', e)
        }
      })
    },
    onDisconnect: () => {
      connected.value = false
    },
    onStompError: () => {
      connected.value = false
      reconnectCount.value++
      if (reconnectCount.value >= maxReconnect) {
        console.error('[KDS] 重连次数超过上限，请检查网络')
      }
    }
  })

  // 激活连接
  client.activate()

  onUnmounted(() => {
    client.deactivate()
  })

  return { orders, connected, reconnectCount }
}
