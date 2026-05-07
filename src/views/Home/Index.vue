<template>
  <div>
    <!-- 销售汇总卡片 -->
    <el-row :gutter="12" class="mb-12px">
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">今日订单</div>
          <div class="stat-value">{{ dashboard?.salesSummary?.todayOrderCount ?? 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">今日销售额</div>
          <div class="stat-value">¥{{ (dashboard?.salesSummary?.todaySales ?? 0).toFixed(0) }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">本月订单</div>
          <div class="stat-value">{{ dashboard?.salesSummary?.monthOrderCount ?? 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">本月销售额</div>
          <div class="stat-value">¥{{ (dashboard?.salesSummary?.monthSales ?? 0).toFixed(0) }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">门店总数</div>
          <div class="stat-value">{{ dashboard?.salesSummary?.totalStores ?? 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">营业中</div>
          <div class="stat-value">{{ dashboard?.salesSummary?.activeStores ?? 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <!-- 左栏：品牌门店资料 -->
      <el-col :span="14">
        <el-card shadow="never" class="mb-12px">
          <template #header>
            <span class="card-header-title">品牌门店资料</span>
          </template>
          <el-scrollbar max-height="420px">
            <div v-if="!dashboard?.brandStores?.length" class="empty-hint">暂无门店数据</div>
            <el-row :gutter="12">
              <el-col v-for="item in dashboard?.brandStores" :key="item.storeId" :span="12" class="mb-12px">
                <el-card shadow="hover" class="store-card">
                  <div class="store-header">
                    <span class="store-name">{{ item.storeName }}</span>
                    <el-tag size="small" type="warning">{{ item.brandName }}</el-tag>
                  </div>
                  <div class="store-body">
                    <div class="store-info" v-if="item.address">
                      <Icon icon="ep:location" :size="14" class="info-icon" />
                      {{ [item.province, item.city, item.district, item.address].filter(Boolean).join('') }}
                    </div>
                    <div class="store-info" v-if="item.phone">
                      <Icon icon="ep:phone" :size="14" class="info-icon" /> {{ item.phone }}
                    </div>
                    <div class="store-info" v-if="item.businessHours">
                      <Icon icon="ep:clock" :size="14" class="info-icon" /> {{ item.businessHours }}
                    </div>
                    <div class="store-tags">
                      <el-tag v-if="item.supportDineIn" size="small" type="success">堂食</el-tag>
                      <el-tag v-if="item.supportTakeout" size="small" type="warning">外卖</el-tag>
                      <el-tag v-if="item.supportPickup" size="small">自提</el-tag>
                      <span v-if="item.areaSize" class="text-12px text-gray-400 ml-8px">{{ item.areaSize }}㎡</span>
                      <span v-if="item.seatCount" class="text-12px text-gray-400 ml-8px">{{ item.seatCount }}座</span>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-scrollbar>
        </el-card>
      </el-col>

      <!-- 右栏：门店销售排行 -->
      <el-col :span="10">
        <el-card shadow="never" class="mb-12px">
          <template #header>
            <span class="card-header-title">门店销售排行</span>
          </template>
          <div v-if="!dashboard?.storeRanking?.length" class="empty-hint">暂无销售数据</div>
          <div v-else class="rank-list">
            <div v-for="(item, idx) in dashboard.storeRanking" :key="item.storeId" class="rank-item">
              <span class="rank-num" :class="{ 'top3': idx < 3 }">{{ idx + 1 }}</span>
              <span class="rank-name">{{ item.storeName }}</span>
              <span class="rank-count">{{ item.orderCount }}单</span>
              <span class="rank-amount">¥{{ item.totalSales.toFixed(0) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <!-- 菜品销售排行 -->
      <el-col :span="14">
        <el-card shadow="never">
          <template #header>
            <span class="card-header-title">菜品销售排行</span>
          </template>
          <div v-if="!dashboard?.dishRanking?.length" class="empty-hint">暂无销售数据</div>
          <el-table v-else :data="dashboard.dishRanking" size="small" max-height="360">
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="dishName" label="菜品" min-width="120" />
            <el-table-column prop="quantity" label="销量" width="80" sortable />
            <el-table-column label="销售额" width="100" sortable sort-by="amount">
              <template #default="scope">¥{{ scope.row.amount.toFixed(0) }}</template>
            </el-table-column>
            <el-table-column prop="storeName" label="所属门店" min-width="130" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 顾客反馈热门词 -->
      <el-col :span="10">
        <el-card shadow="never">
          <template #header>
            <span class="card-header-title">顾客反馈热门词</span>
          </template>
          <div v-if="!dashboard?.hotWords?.length" class="empty-hint">暂无数据</div>
          <div v-else class="hotword-cloud">
            <span
              v-for="item in dashboard.hotWords"
              :key="item.word"
              class="hotword-tag"
              :style="{ fontSize: 12 + item.heat * 0.3 + 'px', color: hotColor(item.heat), opacity: 0.5 + item.heat * 0.005 }"
            >
              {{ item.word }}
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { getDashboard, type DashboardVO } from '@/api/restaurant/dashboard'

defineOptions({ name: 'Index' })

const dashboard = ref<DashboardVO | null>(null)
const loading = ref(true)

const hotColor = (heat: number) => {
  if (heat >= 70) return '#e74c3c'
  if (heat >= 40) return '#e67e22'
  if (heat >= 20) return '#2d8cf0'
  return '#909399'
}

onMounted(async () => {
  try {
    dashboard.value = await getDashboard()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.stat-card {
  text-align: center;
}
.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
}
.card-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.empty-hint {
  text-align: center;
  color: #c0c4cc;
  padding: 40px 0;
  font-size: 14px;
}

/* 门店卡片 */
.store-card {
  border: 1px solid #ebeef5;
}
.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.store-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.store-body {
  font-size: 12px;
  color: #606266;
  line-height: 1.8;
}
.store-info {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}
.info-icon {
  flex-shrink: 0;
  color: #909399;
}
.store-tags {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

/* 排行列表 */
.rank-list {
  max-height: 420px;
  overflow-y: auto;
}
.rank-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f2f2f2;
  gap: 10px;
  font-size: 13px;
}
.rank-num {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 4px;
  background: #f0f2f5;
  color: #909399;
  font-weight: 600;
  flex-shrink: 0;
}
.rank-num.top3 {
  background: #e6a23c;
  color: white;
}
.rank-name {
  flex: 1;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rank-count {
  color: #909399;
  flex-shrink: 0;
}
.rank-amount {
  color: #e6a23c;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 70px;
  text-align: right;
}

/* 热词云 */
.hotword-cloud {
  min-height: 300px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
}
.hotword-tag {
  display: inline-block;
  cursor: default;
  font-weight: 600;
  transition: transform 0.2s;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.hotword-tag:hover {
  transform: scale(1.2);
}
</style>
