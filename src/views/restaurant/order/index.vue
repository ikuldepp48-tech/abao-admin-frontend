<template>
  <AbaoPageHeader title="订单管理" />

  <!-- 搜索栏 -->
  <AbaoSearchBar @search="handleQuery" @reset="resetQuery">
    <el-form-item label="门店ID">
      <el-input v-model="queryParams.storeId" placeholder="门店ID" clearable />
    </el-form-item>
    <el-form-item label="订单状态">
      <el-select v-model="queryParams.status" placeholder="全部" clearable>
        <el-option label="待支付" :value="0" />
        <el-option label="已支付" :value="1" />
        <el-option label="备餐中" :value="2" />
        <el-option label="已出餐" :value="3" />
        <el-option label="已完成" :value="4" />
        <el-option label="已取消" :value="5" />
      </el-select>
    </el-form-item>
    <el-form-item label="创建时间">
      <el-date-picker
        v-model="queryParams.createTime"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始"
        end-placeholder="结束"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="width: 360px"
      />
    </el-form-item>
  </AbaoSearchBar>

  <!-- 订单列表 -->
  <AbaoCard title="订单列表">
    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="orderNo" label="订单号" width="200" />
      <el-table-column prop="tableId" label="桌台ID" width="80" />
      <el-table-column prop="dinerCount" label="人数" width="60" />
      <el-table-column label="订单类型" width="80">
        <template #default="{ row }">
          {{ orderTypeMap[row.orderType] || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">
            {{ statusMap[row.status] || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="原价" width="100">
        <template #default="{ row }">
          ¥{{ row.originalAmount?.toFixed(2) || '0.00' }}
        </template>
      </el-table-column>
      <el-table-column label="实付" width="100">
        <template #default="{ row }">
          ¥{{ row.payAmount?.toFixed(2) || '0.00' }}
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.remark || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">
          {{ row.createTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDetail(row.id)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </AbaoCard>

  <!-- 详情弹窗 -->
  <el-dialog v-model="detailVisible" title="订单详情" width="700px">
    <el-descriptions v-if="detail" :column="2" border>
      <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(detail.status)">{{ statusMap[detail.status] }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="门店ID">{{ detail.storeId }}</el-descriptions-item>
      <el-descriptions-item label="桌台ID">{{ detail.tableId }}</el-descriptions-item>
      <el-descriptions-item label="订单类型">{{ orderTypeMap[detail.orderType] }}</el-descriptions-item>
      <el-descriptions-item label="就餐人数">{{ detail.dinerCount }}人</el-descriptions-item>
      <el-descriptions-item label="原价">¥{{ detail.originalAmount?.toFixed(2) || '0.00' }}</el-descriptions-item>
      <el-descriptions-item label="实付">¥{{ detail.payAmount?.toFixed(2) || '0.00' }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ detail.remark || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ detail.createTime }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ detail.updateTime || '-' }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { AbaoPageHeader } from '@/components/AbaoPageHeader'
import { AbaoSearchBar } from '@/components/AbaoSearchBar'
import { AbaoCard } from '@/components/AbaoCard'
import * as OrderApi from '@/api/restaurant/order'

defineOptions({ name: 'RestaurantOrder' })

const loading = ref(false)
const list = ref([])
const total = ref(0)
const detailVisible = ref(false)
const detail = ref<any>(null)

const statusMap: Record<number, string> = {
  0: '待支付', 1: '已支付', 2: '备餐中', 3: '已出餐', 4: '已完成', 5: '已取消'
}

const orderTypeMap: Record<number, string> = {
  1: '堂食', 2: '外卖', 3: '自取'
}

function statusTagType(status: number) {
  const map: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'primary', 3: '', 4: 'info', 5: 'danger' }
  return map[status] || 'info'
}

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  storeId: null as any,
  status: null as any,
  createTime: null as any
})

const getList = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize,
      storeId: queryParams.storeId || undefined,
      status: queryParams.status !== null ? queryParams.status : undefined
    }
    if (queryParams.createTime) {
      params.beginCreateTime = queryParams.createTime[0]
      params.endCreateTime = queryParams.createTime[1]
    }
    const data = await OrderApi.getOrderPage(params)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryParams.storeId = null
  queryParams.status = null
  queryParams.createTime = null
  handleQuery()
}

const openDetail = async (id: number) => {
  detailVisible.value = true
  detail.value = await OrderApi.getOrderDetail(id)
}

getList()
</script>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}
</style>
