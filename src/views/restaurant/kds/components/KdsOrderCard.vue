<template>
  <div class="kds-card" :class="urgencyClass">
    <!-- 顶部条 -->
    <div class="card-header">
      <div class="card-header-left">
        <span class="table-no">{{ orderNo }}</span>
        <span class="order-id">#{{ orderId?.toString()?.slice(-4) || '' }}</span>
      </div>
      <div class="card-header-right">
        <span class="elapsed" :class="{ urgent: elapsedMinutes > 15 }">
          {{ elapsedText }}
        </span>
      </div>
    </div>

    <!-- 菜品列表 -->
    <div class="card-body">
      <div v-for="item in items" :key="item.itemId" class="item-row">
        <span class="item-qty">{{ item.quantity }}×</span>
        <span class="item-name">{{ item.spuName }}</span>
        <span class="item-sku">{{ item.skuName }}</span>
        <span v-if="item.customerRemark" class="item-remark">{{ item.customerRemark }}</span>
        <span v-if="item.addonsDesc && item.addonsDesc !== '[]'" class="item-addons">{{ formatAddons(item.addonsDesc) }}</span>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="card-footer">
      <button
        v-if="status === 0"
        class="btn-start"
        @click="$emit('start')"
      >
        开始制作
      </button>
      <button
        v-else-if="status === 1"
        class="btn-finish"
        @click="$emit('finish')"
      >
        完成出餐
      </button>
      <span v-else class="done-label">已出餐</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  orderId: number
  orderNo: string
  createTime: string
  items: Array<{
    itemId: number
    spuName: string
    skuName: string
    quantity: number
    kdsStatus: number
    addonsDesc?: string
    customerRemark?: string
    unitPrice?: number
    subtotal?: number
  }>
}>()

defineEmits<{
  start: []
  finish: []
}>()

// 取第一个 item 的 kdsStatus 作为卡片状态（同一订单的 item 应该状态一致，或者用最"早"的状态）
const status = computed(() => {
  if (!props.items.length) return -1
  return Math.min(...props.items.map(i => i.kdsStatus ?? 0))
})

const elapsedMinutes = computed(() => {
  if (!props.createTime) return 0
  const created = new Date(props.createTime).getTime()
  return Math.floor((Date.now() - created) / 60000)
})

const elapsedText = computed(() => {
  const m = elapsedMinutes.value
  if (m < 1) return '刚刚'
  if (m < 60) return `${m}分钟前`
  return `${Math.floor(m / 60)}小时前`
})

const urgencyClass = computed(() => {
  if (status.value === 2) return 'status-done'
  if (elapsedMinutes.value > 15) return 'status-urgent'
  if (status.value === 1) return 'status-cooking'
  return 'status-pending'
})

function formatAddons(json: string): string {
  try {
    const arr = JSON.parse(json)
    if (!Array.isArray(arr) || arr.length === 0) return ''
    return arr.map((a: any) => a.name || '').filter(Boolean).join('+')
  } catch {
    return ''
  }
}
</script>

<style scoped>
.kds-card {
  width: 480px;
  background: #1a1a1a;
  border: 3px solid #555;
  border-radius: 12px;
  padding: 16px;
  color: #fff;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  box-sizing: border-box;
}

.status-pending {
  border-color: #f5a623;
}
.status-cooking {
  border-color: #4a90d9;
}
.status-done {
  border-color: #7ed321;
  opacity: 0.7;
}
.status-urgent {
  border-color: #d0021b;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
}

.table-no {
  font-size: 32pt;
  font-weight: 700;
  color: #fff;
}

.order-id {
  font-size: 14pt;
  color: #888;
  margin-left: 8px;
}

.elapsed {
  font-size: 16pt;
  color: #aaa;
}
.elapsed.urgent {
  color: #d0021b;
  font-weight: 700;
}

.item-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  padding: 6px 0;
  font-size: 18pt;
  line-height: 1.4;
}

.item-qty {
  font-size: 24pt;
  font-weight: 700;
  color: #f5a623;
  min-width: 50px;
}

.item-name {
  color: #fff;
  font-weight: 600;
}

.item-sku {
  color: #aaa;
  font-size: 14pt;
}

.item-remark {
  color: #d0021b;
  font-style: italic;
  font-size: 14pt;
  width: 100%;
  margin-left: 56px;
}

.item-addons {
  color: #888;
  font-size: 12pt;
  margin-left: 56px;
  width: 100%;
}

.card-footer {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.btn-start {
  width: 100%;
  padding: 16px;
  font-size: 22pt;
  font-weight: 700;
  background: #7ed321;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-finish {
  width: 100%;
  padding: 16px;
  font-size: 22pt;
  font-weight: 700;
  background: #4a90d9;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.done-label {
  width: 100%;
  padding: 16px;
  font-size: 22pt;
  font-weight: 700;
  background: #333;
  color: #666;
  text-align: center;
  border-radius: 8px;
}
</style>
