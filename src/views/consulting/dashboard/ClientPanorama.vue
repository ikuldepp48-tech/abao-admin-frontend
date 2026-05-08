<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    size="85%"
    direction="rtl"
    title="客户全景视图"
  >
    <template #header>
      <div class="panorama-header">
        <span class="panorama-title">客户全景视图（{{ filteredPanorama.length }} 个客户）</span>
      </div>
    </template>

    <!-- 加载 & 错误 -->
    <el-skeleton v-if="loading" animated :rows="6" />
    <div v-else-if="loadError" class="error-state">
      <span>加载失败</span>
      <el-button size="small" @click="fetchData">重试</el-button>
    </div>
    <div v-else-if="!filteredPanorama.length" class="empty-state">
      <el-empty description="暂无符合条件的客户" />
    </div>

    <template v-else>
      <!-- 视图切换 + 筛选 -->
      <div class="panorama-toolbar">
        <div class="view-switch">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="card">卡片</el-radio-button>
            <el-radio-button value="table">表格</el-radio-button>
          </el-radio-group>
        </div>
        <div class="filters">
          <el-select v-model="filterIndustry" placeholder="行业" clearable size="small" class="w-120px">
            <el-option v-for="opt in industryOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <el-select v-model="filterHealth" placeholder="健康度" clearable size="small" class="w-100px ml-8px">
            <el-option label="良好" value="green" />
            <el-option label="注意" value="yellow" />
            <el-option label="预警" value="red" />
          </el-select>
        </div>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'" class="panorama-cards">
        <div
          v-for="item in filteredPanorama"
          :key="item.clientId"
          class="panorama-card"
          :class="'card-' + item.healthLevel"
        >
          <div class="card-head">
            <span class="card-status-dot" :class="item.healthLevel"></span>
            <span class="card-name">{{ truncate(item.clientName, 10) }}</span>
            <span class="card-industry">{{ item.industry || '-' }}</span>
          </div>
          <div class="card-score">
            <span class="score-num" :class="item.healthLevel">{{ item.score }}分</span>
            <span class="score-compare">
              {{ item.score >= (item.avgScore || 0) ? '高于' : '低于' }}平均 {{ Math.abs(item.score - (item.avgScore || 0)) }}分
            </span>
          </div>
          <el-progress
            :percentage="item.score"
            :color="progressColor(item.healthLevel)"
            :show-text="false"
            :stroke-width="8"
            class="card-progress"
          />
          <div class="card-info">
            <div class="info-row">
              <span>项目</span>
              <span>{{ item.activeEngagementCount }} 个进行中</span>
            </div>
            <div class="info-row" v-if="item.storeCount != null">
              <span>门店</span>
              <span>{{ item.storeCount }} 家</span>
            </div>
            <div class="info-row" v-if="item.engagementTitles.length">
              <span>包含</span>
              <span class="project-names">{{ item.engagementTitles.join('、') }}</span>
            </div>
          </div>
          <div class="card-foot">
            <el-button link size="small" type="primary" @click="viewClient(item.clientId)">查看详情</el-button>
          </div>
        </div>
      </div>

      <!-- 表格视图 -->
      <el-table v-else :data="filteredPanorama" stripe size="small" class="panorama-table">
        <el-table-column label="客户名称" prop="clientName" min-width="120" sortable>
          <template #default="{ row }">
            <span class="table-name">
              <span class="card-status-dot" :class="row.healthLevel"></span>
              {{ row.clientName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="行业" prop="industry" width="80" sortable />
        <el-table-column label="健康分" prop="score" width="90" sortable>
          <template #default="{ row }">
            <span class="table-score" :class="row.healthLevel">{{ row.score }}</span>
            <span class="table-compare text-11px ml-4px">
              (均{{ row.avgScore }})
            </span>
          </template>
        </el-table-column>
        <el-table-column label="健康度" prop="healthLevel" width="90">
          <template #default="{ row }">
            <el-tag :type="row.healthLevel === 'green' ? 'success' : row.healthLevel === 'yellow' ? 'warning' : 'danger'" size="small">
              {{ row.healthLevel === 'green' ? '良好' : row.healthLevel === 'yellow' ? '注意' : '预警' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="门店数" prop="storeCount" width="80" sortable />
        <el-table-column label="项目" min-width="150">
          <template #default="{ row }">
            {{ row.engagementTitles?.join('、') || '-' }}
          </template>
        </el-table-column>
      </el-table>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { getClientPanorama, type ClientPanoramaVO } from '@/api/consulting/dashboard'
import { useRouter } from 'vue-router'

defineOptions({ name: 'ClientPanorama' })

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [val: boolean] }>()

const router = useRouter()

const loading = ref(true)
const loadError = ref(false)
const panorama = ref<ClientPanoramaVO[]>([])
const viewMode = ref('card')
const filterIndustry = ref('')
const filterHealth = ref('')

// ==================== Computed ====================

const industryOptions = computed(() => {
  const set = new Set(panorama.value.map(p => p.industry).filter(Boolean))
  return Array.from(set) as string[]
})

const filteredPanorama = computed(() => {
  let list = panorama.value
  if (filterIndustry.value) {
    list = list.filter(p => p.industry === filterIndustry.value)
  }
  if (filterHealth.value) {
    list = list.filter(p => p.healthLevel === filterHealth.value)
  }
  return list
})

// ==================== Helpers ====================

const progressColor = (level: string) => {
  if (level === 'green') return '#19be6b'
  if (level === 'yellow') return '#e6a23c'
  return '#e74c3c'
}

const truncate = (str: string, max: number) => {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '...' : str
}

const viewClient = (id: number) => {
  emit('update:visible', false)
  router.push({ name: 'ConsultingClient', query: { id } })
}

// ==================== Fetch ====================

async function fetchData() {
  loading.value = true
  loadError.value = false
  try {
    panorama.value = await getClientPanorama()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (val) => {
  if (val) fetchData()
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<style scoped lang="scss">
.panorama-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.panorama-title {
  font-size: 16px;
  font-weight: 600;
}

.error-state, .empty-state {
  text-align: center;
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
}

// ===== Toolbar =====
.panorama-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
.filters {
  display: flex;
  align-items: center;
}

// ===== 卡片视图 =====
.panorama-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.panorama-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px;
  transition: box-shadow 0.2s;

  &:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
  &.card-red    { border-left: 3px solid #e74c3c; }
  &.card-yellow { border-left: 3px solid #e6a23c; }
  &.card-green  { border-left: 3px solid #19be6b; }
}
.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.card-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;

  &.green  { background: #19be6b; }
  &.yellow { background: #e6a23c; }
  &.red    { background: #e74c3c; }
}
.card-name {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-industry {
  font-size: 11px;
  color: #909399;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
}
.card-score {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}
.score-num {
  font-size: 28px;
  font-weight: 700;

  &.red    { color: #e74c3c; }
  &.yellow { color: #e6a23c; }
  &.green  { color: #19be6b; }
}
.score-compare {
  font-size: 12px;
  color: #909399;
}
.card-progress {
  margin-bottom: 10px;
}
.card-info {
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;

  > span:first-child { color: #909399; }
}
.project-names {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-foot {
  text-align: right;
  border-top: 1px solid #f2f2f2;
  padding-top: 8px;
}

// ===== 表格视图 =====
.panorama-table {
  margin-top: 8px;
}
.table-name {
  display: flex;
  align-items: center;
  gap: 6px;
}
.table-score {
  font-weight: 700;
  &.red    { color: #e74c3c; }
  &.yellow { color: #e6a23c; }
  &.green  { color: #19be6b; }
}
.table-compare {
  color: #c0c4cc;
}

// ===== 响应式 =====
@media (max-width: 767px) {
  .panorama-cards {
    grid-template-columns: 1fr;
  }
  .panorama-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
