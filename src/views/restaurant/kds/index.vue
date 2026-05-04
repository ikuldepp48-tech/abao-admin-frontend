<template>
  <!-- 未选档口 → 选择页 -->
  <StationSelector
    v-if="!stationId"
    @select="onSelectStation"
  />

  <!-- KDS 主界面 -->
  <div v-else class="kds-screen">
    <!-- 顶部信息栏 -->
    <div class="top-bar">
      <div class="top-left">
        <span class="station-name">{{ stationName }}</span>
      </div>
      <div class="top-center">
        <span class="clock">{{ clock }}</span>
      </div>
      <div class="top-right">
        <span class="stats">
          待制作 {{ pendingCount }} / 制作中 {{ cookingCount }}
        </span>
        <span class="connection" :class="{ disconnected: !connected }">
          {{ connected ? '●' : '○' }}
        </span>
      </div>
    </div>

    <!-- 订单卡片网格 -->
    <div class="order-grid">
      <KdsOrderCard
        v-for="[orderId, order] in orderList"
        :key="orderId"
        :order-id="order.orderId"
        :order-no="order.orderNo || ''"
        :create-time="order.createTime || ''"
        :items="order.items"
        @start="onStart(order.orderId, order.items)"
        @finish="onFinish(order.orderId, order.items)"
      />
      <div v-if="orderList.length === 0" class="empty-hint">
        暂无订单，等待中...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StationSelector from './components/StationSelector.vue'
import KdsOrderCard from './components/KdsOrderCard.vue'
import { useKdsWebSocket } from './composables/useKdsWebSocket'
import * as KdsApi from '@/api/restaurant/kds'
import request from '@/config/axios'

const route = useRoute()
const router = useRouter()

const stationId = ref<number>(Number(route.query.stationId) || 0)
const stationName = ref('')

// 时钟
const clock = ref('')
let clockTimer: ReturnType<typeof setInterval> | null = null

// WebSocket
const { orders, connected } = stationId.value > 0
  ? useKdsWebSocket(stationId.value)
  : { orders: ref(new Map()), connected: ref(false) }

const orderList = computed(() => {
  return Array.from(orders.value.entries())
})

const pendingCount = computed(() => {
  let count = 0
  orders.value.forEach((order) => {
    if (order.items.some(i => i.kdsStatus === 0)) count++
  })
  return count
})

const cookingCount = computed(() => {
  let count = 0
  orders.value.forEach((order) => {
    if (order.items.some(i => i.kdsStatus === 1) && order.items.every(i => i.kdsStatus !== 0)) count++
  })
  return count
})

function onSelectStation(id: number) {
  router.replace({ path: '/kds', query: { stationId: id } })
  window.location.reload()
}

// 加载历史订单
async function loadHistory() {
  try {
    const res = await KdsApi.getOrderList(stationId.value)
    const data = res // response is Map<orderId, List<item>>
    if (data && typeof data === 'object') {
      for (const [orderIdStr, items] of Object.entries(data)) {
        const orderId = Number(orderIdStr)
        const itemList = items as any[]
        orders.value.set(orderId, {
          orderId,
          orderNo: '',
          createTime: '',
          items: itemList.map((i: any) => ({
            itemId: i.id,
            spuName: i.spuName || '',
            skuName: i.skuName || '',
            quantity: i.quantity || 0,
            kdsStatus: i.kdsStatus ?? 0,
            addonsDesc: i.addonsJson || '[]',
            customerRemark: i.customerRemark || '',
            unitPrice: i.unitPrice || 0,
            subtotal: i.subtotal || 0
          }))
        })
      }
      orders.value = new Map(orders.value)
    }
  } catch (e) {
    console.error('[KDS] 加载历史订单失败', e)
  }
}

// 加载档口名称
async function loadStationName() {
  try {
    const res = await request.get({ url: '/restaurant/kitchen-station/get', params: { id: stationId.value } })
    stationName.value = res.name || '档口'
  } catch {
    stationName.value = '档口 ' + stationId.value
  }
}

async function onStart(orderId: number, items: any[]) {
  // 开始制作所有待制作的 item
  for (const item of items) {
    if (item.kdsStatus === 0) {
      try {
        await KdsApi.startItem(item.itemId)
      } catch (e) {
        console.error('[KDS] 开始制作失败', e)
      }
    }
  }
}

async function onFinish(orderId: number, items: any[]) {
  // 完成所有制作中的 item
  for (const item of items) {
    if (item.kdsStatus === 1) {
      try {
        await KdsApi.finishItem(item.itemId)
      } catch (e) {
        console.error('[KDS] 完成出餐失败', e)
      }
    }
  }
}

// 时钟更新
function updateClock() {
  const now = new Date()
  clock.value = now.toLocaleTimeString('zh-CN', { hour12: false })
}

onMounted(() => {
  if (stationId.value > 0) {
    loadStationName()
    loadHistory()
    updateClock()
    clockTimer = setInterval(updateClock, 1000)
  }
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<style scoped>
.kds-screen {
  width: 100vw;
  height: 100vh;
  background: #000;
  color: #fff;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #111;
  border-bottom: 2px solid #333;
  height: 64px;
  box-sizing: border-box;
}

.top-left {
  flex: 1;
}

.station-name {
  font-size: 22pt;
  font-weight: 700;
  color: #f5a623;
}

.top-center {
  flex: 1;
  text-align: center;
}

.clock {
  font-size: 28pt;
  font-weight: 300;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.top-right {
  flex: 1;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.stats {
  font-size: 14pt;
  color: #aaa;
}

.connection {
  font-size: 16pt;
  color: #7ed321;
}
.connection.disconnected {
  color: #d0021b;
}

.order-grid {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  overflow-y: auto;
  align-content: flex-start;
  justify-content: flex-start;
}

.empty-hint {
  width: 100%;
  text-align: center;
  font-size: 24pt;
  color: #333;
  margin-top: 100px;
}
</style>
