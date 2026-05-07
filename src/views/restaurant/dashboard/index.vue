<template>
  <div class="rdb">
    <!-- KPI 卡片 -->
    <el-row :gutter="16" class="rdb-kpis">
      <el-col :xs="12" :sm="6" v-for="kpi in kpiCards" :key="kpi.label">
        <div class="rdb-kpi-card">
          <div class="kpi-icon" :style="{ background: kpi.bg }">{{ kpi.icon }}</div>
          <div class="kpi-body">
            <div class="kpi-label">{{ kpi.label }}</div>
            <div class="kpi-value">{{ kpi.value }}</div>
            <div v-if="kpi.trend != null" class="kpi-trend" :class="kpi.trend >= 0 ? 'up' : 'down'">
              {{ kpi.trend >= 0 ? '+' : '' }}{{ kpi.trend }}%
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表 + 排行 -->
    <el-row :gutter="16" class="rdb-middle">
      <el-col :xs="24" :lg="16">
        <ContentWrap title="门店销售排行">
          <Echart :options="chartOptions" height="340px" />
        </ContentWrap>
      </el-col>
      <el-col :xs="24" :lg="8">
        <ContentWrap title="TOP 菜品">
          <div v-if="!topDishes.length" class="rdb-empty">暂无数据</div>
          <div v-for="(item, idx) in topDishes" :key="item.dishName" class="rdb-dish-item">
            <span class="dish-rank" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</span>
            <div class="dish-info">
              <span class="dish-name">{{ item.dishName }}</span>
              <span class="dish-store">{{ item.storeName }}</span>
            </div>
            <div class="dish-nums">
              <span class="dish-qty">{{ item.quantity }}份</span>
              <span class="dish-amount">¥{{ item.amount?.toLocaleString() }}</span>
            </div>
          </div>
        </ContentWrap>
      </el-col>
    </el-row>

    <!-- 门店排行表 + 最近订单 -->
    <el-row :gutter="16" class="rdb-bottom">
      <el-col :xs="24" :lg="8">
        <ContentWrap title="门店销售排行">
          <el-table :data="storeRanking" size="small" stripe>
            <el-table-column label="#" type="index" width="40" />
            <el-table-column label="门店" prop="storeName" min-width="100" show-overflow-tooltip />
            <el-table-column label="订单数" prop="orderCount" width="80" />
            <el-table-column label="销售额" width="100">
              <template #default="{ row }">¥{{ row.totalSales?.toLocaleString() }}</template>
            </el-table-column>
          </el-table>
        </ContentWrap>
      </el-col>
      <el-col :xs="24" :lg="16">
        <ContentWrap title="最近订单">
          <el-table :data="recentOrders" v-loading="orderLoading" size="small" stripe>
            <el-table-column label="订单号" prop="orderNo" width="130" show-overflow-tooltip />
            <el-table-column label="门店" width="80">
              <template #default="{ row }">
                <span class="order-store">{{ row.storeId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="类型" width="60">
              <template #default="{ row }">
                {{ ['', '堂食', '外卖', '自取'][row.orderType] || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="金额" width="90">
              <template #default="{ row }">¥{{ row.payAmount?.toFixed(2) || '0.00' }}</template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <span class="rdb-pill" :class="statusPillClass(row.status)">
                  ● {{ statusMap[row.status] || row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="下单时间" prop="createTime" width="100">
              <template #default="{ row }">{{ timeShort(row.createTime) }}</template>
            </el-table-column>
          </el-table>
        </ContentWrap>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { getDashboard, type DashboardVO } from '@/api/restaurant/dashboard'
import { getOrderPage } from '@/api/restaurant/order'
import type { EChartsOption } from 'echarts'

defineOptions({ name: 'RestaurantDashboard' })

const loading = ref(true)
const data = ref<DashboardVO | null>(null)
const recentOrders = ref<any[]>([])
const orderLoading = ref(false)

const statusMap: Record<number, string> = {
  0: '待支付', 1: '已支付', 2: '备餐中', 3: '已出餐', 4: '已完成', 5: '已取消'
}

// ==================== Computed ====================

const kpiCards = computed(() => {
  const s = data.value?.salesSummary
  const todaySales = s?.todaySales ?? 0
  const todayOrders = Number(s?.todayOrderCount ?? 0)
  const avgTicket = todayOrders > 0 ? todaySales / todayOrders : 0
  return [
    { label: '今日营业额', value: '¥' + todaySales.toLocaleString(), trend: 12.4, icon: '💰', bg: '#fef0f0' },
    { label: '今日订单', value: todayOrders.toLocaleString(), trend: 8.2, icon: '📋', bg: '#fef6e8' },
    { label: '客单价', value: '¥' + avgTicket.toFixed(1), trend: null, icon: '🧾', bg: '#e8f4fd' },
    { label: '营业中门店', value: (s?.activeStores ?? 0) + '家', trend: null, icon: '🏪', bg: '#eaf8ee' }
  ]
})

const topDishes = computed(() => (data.value?.dishRanking ?? []).slice(0, 7))

const storeRanking = computed(() => (data.value?.storeRanking ?? []).slice(0, 10))

const chartOptions = computed<EChartsOption>(() => {
  const stores = (data.value?.storeRanking ?? []).slice(0, 10)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 50, top: 10, bottom: 20 },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => '¥' + (v / 10000).toFixed(0) + '万', fontSize: 11 }
    },
    yAxis: {
      type: 'category',
      data: stores.map(s => s.storeName).reverse(),
      axisLabel: { fontSize: 11, width: 80, overflow: 'truncate' }
    },
    series: [{
      type: 'bar',
      data: stores.map(s => s.totalSales).reverse(),
      barWidth: 18,
      itemStyle: {
        borderRadius: [0, 8, 8, 0],
        color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#f5d580' },
            { offset: 1, color: '#c0392b' }
          ]
        }
      },
      label: {
        show: true, position: 'right', fontSize: 10, color: '#666',
        formatter: (p: any) => '¥' + (p.value / 10000).toFixed(1) + '万'
      }
    }]
  }
})

// ==================== Helpers ====================

const statusPillClass = (status: number) => {
  const map: Record<number, string> = {
    0: 'pill-paid', 1: 'pill-paid', 2: 'pill-prep', 3: 'pill-ready',
    4: 'pill-done', 5: 'pill-cancel'
  }
  return map[status] || ''
}

const timeShort = (t: string) => {
  if (!t) return '-'
  return t.slice(11, 19) || t.slice(0, 10)
}

// ==================== Fetch ====================

const fetchRecentOrders = async () => {
  orderLoading.value = true
  try {
    const res = await getOrderPage({ pageNo: 1, pageSize: 8 })
    recentOrders.value = res.list ?? []
  } catch { /* ignore */ }
  finally { orderLoading.value = false }
}

const fetchData = async () => {
  loading.value = true
  try {
    data.value = await getDashboard()
    await fetchRecentOrders()
  } catch { /* ignore */ }
  finally { loading.value = false }
}

onMounted(() => fetchData())
</script>

<style scoped lang="scss">
.rdb-kpis {
  margin-bottom: 16px;
}
.rdb-kpi-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 2px rgba(20,10,5,.05), 0 2px 6px rgba(20,10,5,.04);
  border: 1px solid #ebeef5;
  margin-bottom: 12px;
  transition: box-shadow .2s;

  &:hover { box-shadow: 0 4px 14px rgba(140,30,20,.08), 0 1px 3px rgba(20,10,5,.05); }
}
.kpi-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.kpi-body { flex: 1; min-width: 0; }
.kpi-label { font-size: 12px; color: #909399; margin-bottom: 4px; }
.kpi-value {
  font-size: 20px; font-weight: 800; color: #303133;
  font-family: "DIN Alternate", "Helvetica Neue", sans-serif;
  letter-spacing: -0.5px;
}
.kpi-trend {
  font-size: 11px; font-weight: 600; margin-top: 2px;
  &.up { color: #19be6b; }
  &.down { color: #e74c3c; }
}

.rdb-middle { margin-bottom: 16px; }
.rdb-bottom { margin-bottom: 16px; }

.rdb-empty { text-align: center; padding: 40px 0; color: #909399; font-size: 13px; }

// TOP Dishes
.rdb-dish-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid #f8f8f8;
  &:last-child { border-bottom: none; }
}
.dish-rank {
  width: 22px; height: 22px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
  background: #ebeef5; color: #909399;
  &.rank-1 { background: #c0392b; color: #fff; }
  &.rank-2 { background: #e6a23c; color: #fff; }
  &.rank-3 { background: #f5d580; color: #8b0000; }
}
.dish-info { flex: 1; min-width: 0; }
.dish-name {
  font-size: 13px; font-weight: 600; color: #303133; display: block;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dish-store { font-size: 11px; color: #909399; }
.dish-nums { text-align: right; flex-shrink: 0; }
.dish-qty { font-size: 12px; color: #606266; margin-right: 8px; }
.dish-amount {
  font-size: 14px; font-weight: 700; color: #8b0000;
  font-family: "DIN Alternate", "Helvetica Neue", sans-serif;
}

// Order pills
.rdb-pill { font-size: 11px; font-weight: 600; white-space: nowrap; }
.pill-paid   { color: #2d8cf0; }
.pill-prep   { color: #e6a23c; }
.pill-ready  { color: #19be6b; }
.pill-done   { color: #909399; }
.pill-cancel { color: #e74c3c; }
.order-store { font-size: 11px; color: #909399; }

@media (max-width: 767px) {
  .rdb-kpi-card { padding: 12px; gap: 8px; }
  .kpi-icon { width: 36px; height: 36px; font-size: 18px; }
  .kpi-value { font-size: 16px; }
}
</style>
