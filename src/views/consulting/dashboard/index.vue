<template>
  <div class="dashboard">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="12" class="mb-12px">
      <el-col :xs="12" :sm="6" v-for="card in statCards" :key="card.label">
        <el-card shadow="hover" class="stat-card">
          <el-skeleton :loading="loading" animated :rows="2">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ card.value }}</div>
          </el-skeleton>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <!-- 客户健康度 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="mb-12px dashboard-card">
          <template #header>
            <div class="card-header">
              <span class="card-header-title">客户健康度</span>
              <el-button link type="primary" @click="panoramaVisible = true">
                全景视图
              </el-button>
            </div>
          </template>

          <!-- 加载/错误/空状态 -->
          <el-skeleton v-if="loading" animated :rows="5" />
          <div v-else-if="loadError.ranking" class="error-state">
            <span>加载失败</span>
            <el-button size="small" @click="fetchData">重试</el-button>
          </div>
          <div v-else-if="!ranking.length" class="empty-state">
            <el-empty description="暂无客户数据" />
          </div>

          <template v-else>
            <!-- 健康度统计条 -->
            <div class="health-summary">
              <span class="health-dot green">🟢 {{ healthStats.green }} 良好</span>
              <span class="health-dot yellow">🟡 {{ healthStats.yellow }} 注意</span>
              <span class="health-dot red">🔴 {{ healthStats.red }} 预警</span>
            </div>

            <!-- 客户列表 -->
            <div class="client-list">
              <div
                v-for="item in ranking"
                :key="item.clientId"
                class="client-item"
              >
                <div class="client-top">
                  <span class="client-status-dot" :class="item.healthLevel" />
                  <span class="client-name" :title="item.clientName">{{ truncate(item.clientName, 8) }}</span>
                  <span class="client-score" :class="item.healthLevel">{{ item.score }}分</span>
                </div>
                <el-progress
                  :percentage="item.score"
                  :color="progressColor(item.healthLevel)"
                  :show-text="false"
                  :stroke-width="6"
                  class="client-progress"
                />
                <div class="client-bottom">
                  <div class="client-warnings">
                    <span v-for="w in item.warnings" :key="w" class="warning-tag">{{ w }}</span>
                  </div>
                  <div class="client-actions">
                    <el-button link size="small" type="primary" @click="viewClient(item.clientId)">查看详情</el-button>
                    <el-button v-if="item.urgentAction" link size="small" type="danger" @click="viewClient(item.clientId)">
                      {{ item.urgentAction }}
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-card>
      </el-col>

      <!-- 紧急待办 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="mb-12px dashboard-card">
          <template #header>
            <span class="card-header-title">紧急待办</span>
          </template>

          <el-skeleton v-if="loading" animated :rows="5" />
          <div v-else-if="loadError.todos" class="error-state">
            <span>加载失败</span>
            <el-button size="small" @click="fetchData">重试</el-button>
          </div>
          <div v-else-if="!filteredTodos.length" class="empty-state">
            <el-empty description="暂无待办" />
          </div>

          <template v-else>
            <!-- 筛选标签 -->
            <div class="todo-filter mb-8px">
              <el-radio-group v-model="todoFilter" size="small">
                <el-radio-button value="all">全部</el-radio-button>
                <el-radio-button value="contract_expiring">合同</el-radio-button>
                <el-radio-button value="phase_stalled">阶段</el-radio-button>
                <el-radio-button value="deliverable_due">交付</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 必须本周 -->
            <div v-if="criticalTodos.length" class="todo-section">
              <div class="todo-section-title critical">必须本周处理</div>
              <div v-for="item in criticalTodos" :key="item.title" class="todo-item">
                <div class="todo-left">
                  <el-tag type="danger" size="small" class="todo-tag">{{ item.type === 'contract_expiring' ? '合同' : item.type === 'phase_stalled' ? '阶段' : '交付' }}</el-tag>
                  <span class="todo-title">{{ item.title }}</span>
                </div>
                <div class="todo-meta">
                  <span class="todo-days critical">
                    {{ item.daysRemaining <= 0 ? '已超时' + Math.abs(item.daysRemaining) + '天' : item.daysRemaining + '天后' }}
                  </span>
                  <span class="todo-client">{{ truncate(item.clientName, 6) }}</span>
                </div>
                <div class="todo-actions">
                  <el-button
                    v-for="act in item.actions"
                    :key="act"
                    link
                    size="small"
                    :type="act === '终止' ? 'danger' : 'primary'"
                  >{{ act }}</el-button>
                </div>
              </div>
            </div>

            <!-- 本周关注 -->
            <div v-if="warningTodos.length" class="todo-section">
              <div class="todo-section-title warning">本周内关注</div>
              <div v-for="item in warningTodos" :key="item.title" class="todo-item">
                <div class="todo-left">
                  <el-tag type="warning" size="small" class="todo-tag">{{ item.type === 'contract_expiring' ? '合同' : item.type === 'phase_stalled' ? '阶段' : '交付' }}</el-tag>
                  <span class="todo-title">{{ item.title }}</span>
                </div>
                <div class="todo-meta">
                  <span class="todo-days warning">{{ item.daysRemaining }}天后</span>
                  <span class="todo-client">{{ truncate(item.clientName, 6) }}</span>
                </div>
                <div class="todo-actions">
                  <el-button
                    v-for="act in item.actions"
                    :key="act"
                    link
                    size="small"
                    type="primary"
                  >{{ act }}</el-button>
                </div>
              </div>
            </div>

            <!-- 后续提醒 -->
            <div v-if="infoTodos.length" class="todo-section">
              <div class="todo-section-title info">后续提醒</div>
              <div v-for="item in infoTodos" :key="item.title" class="todo-item">
                <div class="todo-left">
                  <el-tag type="info" size="small" class="todo-tag">{{ item.type === 'contract_expiring' ? '合同' : item.type === 'phase_stalled' ? '阶段' : '交付' }}</el-tag>
                  <span class="todo-title">{{ item.title }}</span>
                </div>
                <div class="todo-meta">
                  <span class="todo-days info">{{ item.daysRemaining }}天后</span>
                  <span class="todo-client">{{ truncate(item.clientName, 6) }}</span>
                </div>
                <div class="todo-actions">
                  <el-button
                    v-for="act in item.actions"
                    :key="act"
                    link
                    size="small"
                  >{{ act }}</el-button>
                </div>
              </div>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <!-- 本周日程 -->
    <el-card shadow="never" class="dashboard-card">
      <template #header>
        <span class="card-header-title">本周日程</span>
      </template>

      <el-skeleton v-if="loading" animated :rows="3" />
      <div v-else-if="loadError.schedule" class="error-state">
        <span>加载失败</span>
        <el-button size="small" @click="fetchData">重试</el-button>
      </div>
      <div v-else-if="!schedule.length" class="empty-state">
        <el-empty description="本周暂无日程" />
      </div>

      <el-timeline v-else>
        <el-timeline-item
          v-for="item in schedule"
          :key="item.date + item.title"
          :timestamp="relativeDate(item.date)"
          placement="top"
          :color="scheduleColor(item.type)"
        >
          <el-card shadow="hover" class="schedule-card">
            <div class="flex justify-between items-center">
              <span class="text-14px font-600">{{ item.title }}</span>
              <div class="text-12px text-gray-400">
                <el-tag size="small" :type="scheduleTagType(item.type)">{{ scheduleTypeLabel(item.type) }}</el-tag>
                <span class="ml-8px">{{ item.clientName }}</span>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 全景视图抽屉 -->
    <ClientPanorama v-model:visible="panoramaVisible" />
  </div>
</template>

<script setup lang="ts">
import {
  getDashboardSummary,
  getClientRanking,
  getUrgentTodos,
  getWeekSchedule,
  type DashboardSummaryVO,
  type ClientRankingItemVO,
  type UrgentTodoItemVO,
  type WeekScheduleItemVO
} from '@/api/consulting/dashboard'
import ClientPanorama from './ClientPanorama.vue'
import { useRouter } from 'vue-router'

defineOptions({ name: 'ConsultingDashboard' })

const router = useRouter()

const loading = ref(true)
const loadError = reactive({
  summary: false,
  ranking: false,
  todos: false,
  schedule: false
})

const summary = ref<DashboardSummaryVO | null>(null)
const ranking = ref<ClientRankingItemVO[]>([])
const todos = ref<UrgentTodoItemVO[]>([])
const schedule = ref<WeekScheduleItemVO[]>([])
const todoFilter = ref('all')
const panoramaVisible = ref(false)

// ==================== Computed ====================

const statCards = computed(() => [
  { label: '客户总数', value: summary.value?.totalClients ?? 0 },
  { label: '进行中项目', value: summary.value?.activeEngagements ?? 0 },
  { label: '已完成项目', value: summary.value?.completedEngagements ?? 0 },
  { label: '合同总额', value: summary.value?.totalContractAmount != null ? '¥' + (summary.value.totalContractAmount * 10000).toLocaleString() : '¥0' }
])

const healthStats = computed(() => {
  const g = ranking.value.filter(r => r.healthLevel === 'green').length
  const y = ranking.value.filter(r => r.healthLevel === 'yellow').length
  const r = ranking.value.filter(r => r.healthLevel === 'red').length
  return { green: g, yellow: y, red: r }
})

const filteredTodos = computed(() => {
  if (todoFilter.value === 'all') return todos.value
  return todos.value.filter(t => t.type === todoFilter.value)
})

const criticalTodos = computed(() => filteredTodos.value.filter(t => t.priority === 'critical'))
const warningTodos = computed(() => filteredTodos.value.filter(t => t.priority === 'warning'))
const infoTodos = computed(() => filteredTodos.value.filter(t => t.priority === 'info'))

// ==================== Helpers ====================

const progressColor = (level: string) => {
  if (level === 'green') return '#19be6b'
  if (level === 'yellow') return '#e6a23c'
  return '#e74c3c'
}

const scheduleColor = (type: string) => {
  if (type === 'phase_completed') return '#19be6b'
  if (type === 'deliverable_due') return '#e74c3c'
  if (type === 'engagement_end') return '#e6a23c'
  return '#2d8cf0'
}

const scheduleTagType = (type: string) => {
  if (type === 'phase_completed') return 'success'
  if (type === 'deliverable_due') return 'danger'
  if (type === 'engagement_end') return 'warning'
  return 'info'
}

const scheduleTypeLabel = (type: string) => {
  if (type === 'phase_completed') return '阶段完成'
  if (type === 'engagement_start') return '项目启动'
  if (type === 'engagement_end') return '项目到期'
  if (type === 'deliverable_due') return '交付截止'
  return type
}

const relativeDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((date.getTime() - now.getTime()) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === -1) return '昨天'
  if (diff < 0) return Math.abs(diff) + '天前'
  if (diff <= 7) return diff + '天后'
  return dateStr
}

const truncate = (str: string, max: number) => {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '...' : str
}

const viewClient = (id: number) => {
  router.push({ name: 'ConsultingClient', query: { id } })
}

// ==================== Fetch ====================

async function fetchData() {
  loading.value = true
  loadError.ranking = false
  loadError.todos = false
  loadError.schedule = false

  try {
    const [s, r, t, sch] = await Promise.all([
      getDashboardSummary(),
      getClientRanking(),
      getUrgentTodos(),
      getWeekSchedule()
    ])
    summary.value = s
    ranking.value = r
    todos.value = t
    schedule.value = sch
  } catch {
    loadError.ranking = true
    loadError.todos = true
    loadError.schedule = true
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())
</script>

<style scoped lang="scss">
.dashboard {
  --dash-red: #e74c3c;
  --dash-yellow: #e6a23c;
  --dash-green: #19be6b;
  --dash-blue: #2d8cf0;
}

// ===== 统计卡片 =====
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

// ===== 通用 =====
.dashboard-card {
  border-radius: 8px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.empty-state, .error-state {
  text-align: center;
  padding: 20px 0;
  color: #909399;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

// ===== 健康度 =====
.health-summary {
  display: flex;
  gap: 16px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f2f2f2;
  font-size: 13px;
}
.health-dot {
  font-size: 13px;
  color: #606266;
}

.client-list {
  max-height: 340px;
  overflow-y: auto;
}
.client-item {
  padding: 10px 0;
  border-bottom: 1px solid #f8f8f8;

  &:last-child { border-bottom: none; }
}
.client-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.client-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;

  &.green  { background: var(--dash-green); }
  &.yellow { background: var(--dash-yellow); }
  &.red    { background: var(--dash-red); }
}
.client-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.client-score {
  font-size: 16px;
  font-weight: 700;
  &.red    { color: var(--dash-red); }
  &.yellow { color: var(--dash-yellow); }
  &.green  { color: var(--dash-green); }
}
.client-progress {
  margin-bottom: 6px;
}
.client-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.client-warnings {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.warning-tag {
  padding: 1px 6px;
  border-radius: 3px;
  background: #fef0f0;
  color: #e74c3c;
  font-size: 11px;
}
.client-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

// ===== 待办 =====
.todo-filter {
  display: flex;
  gap: 8px;
}
.todo-section {
  margin-bottom: 12px;
}
.todo-section-title {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 0 8px;
  border-bottom: 1px dashed #eee;
  margin-bottom: 8px;

  &.critical { color: var(--dash-red); }
  &.warning  { color: var(--dash-yellow); }
  &.info     { color: var(--dash-blue); }
}
.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f8f8f8;
  font-size: 13px;
  gap: 8px;
  flex-wrap: wrap;

  &:last-child { border-bottom: none; }
}
.todo-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.todo-tag {
  flex-shrink: 0;
}
.todo-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #303133;
}
.todo-meta {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  font-size: 12px;
}
.todo-days {
  &.critical { color: var(--dash-red); font-weight: 600; }
  &.warning  { color: var(--dash-yellow); }
  &.info     { color: #909399; }
}
.todo-client {
  color: #909399;
}
.todo-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

// ===== 日程 =====
.schedule-card {
  margin-bottom: 4px;
}

// ===== 响应式 =====
@media (max-width: 1199px) {
  .stat-value { font-size: 18px; }
  .client-list { max-height: unset; }
}
@media (max-width: 767px) {
  .stat-value { font-size: 16px; }
  .stat-label { font-size: 12px; }

  .client-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .client-actions {
    align-self: flex-end;
  }

  .todo-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .todo-meta {
    margin-left: 28px;
  }
  .todo-actions {
    align-self: flex-end;
  }

  .health-summary {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
