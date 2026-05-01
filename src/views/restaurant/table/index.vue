<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
      <el-form-item label="桌号" prop="tableNo">
        <el-input v-model="queryParams.tableNo" placeholder="请输入桌号" clearable @keyup.enter="handleQuery" class="!w-240px" />
      </el-form-item>
      <el-form-item label="门店" prop="storeId">
        <el-select v-model="queryParams.storeId" placeholder="请选择门店" clearable class="!w-240px">
          <el-option v-for="s in storeList" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" @click="openForm('create')" v-hasPermi="['restaurant:table:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button type="success" @click="openBatchForm" v-hasPermi="['restaurant:table:create']">
          <Icon icon="ep:document-add" class="mr-5px" /> 批量创建
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" min-width="60" />
      <el-table-column label="桌号" align="center" prop="tableNo" min-width="100" />
      <el-table-column label="区域" align="center" prop="area" min-width="80" />
      <el-table-column label="座位数" align="center" prop="seatCapacity" min-width="70" />
      <el-table-column label="状态" align="center" prop="status" min-width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" type="success">空闲</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="warning">用餐中</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="danger">待结账</el-tag>
          <el-tag v-else type="info">已锁定</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="二维码" align="center" prop="qrCode" min-width="80">
        <template #default="scope">
          <el-image v-if="scope.row.qrCode" :src="scope.row.qrCode" class="h-30px w-30px" :preview-src-list="[scope.row.qrCode]" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" min-width="170" />
      <el-table-column label="操作" align="center" min-width="150px" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)" v-hasPermi="['restaurant:table:update']">编辑</el-button>
          <el-button link type="success" @click="handleGenerateQr(scope.row.id)" v-hasPermi="['restaurant:table:update']">生成二维码</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['restaurant:table:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <TableForm ref="formRef" @success="getList" />
  <BatchForm ref="batchFormRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import * as TableApi from '@/api/restaurant/table'
import * as StoreApi from '@/api/restaurant/store'
import TableForm from './TableForm.vue'
import BatchForm from './BatchForm.vue'

defineOptions({ name: 'RestaurantTable' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref([])
const total = ref(0)
const storeList = ref([] as any[])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  tableNo: null,
  storeId: null
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await TableApi.getTablePage(queryParams)
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
  queryFormRef.value.resetFields()
  handleQuery()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const batchFormRef = ref()
const openBatchForm = () => {
  batchFormRef.value.open()
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await TableApi.deleteTable(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleGenerateQr = async (id: number) => {
  window.open(`/admin-api/restaurant/table/generate-qr?id=${id}`, '_blank')
}

onMounted(async () => {
  storeList.value = await StoreApi.getSimpleStoreList()
  getList()
})
</script>
