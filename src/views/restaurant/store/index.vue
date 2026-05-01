<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
      <el-form-item label="门店名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入门店名称" clearable @keyup.enter="handleQuery" class="!w-240px" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-240px">
          <el-option v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" @click="openForm('create')" v-hasPermi="['restaurant:store:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" min-width="60" />
      <el-table-column label="门店名称" align="center" prop="name" min-width="120" />
      <el-table-column label="门店编码" align="center" prop="code" min-width="100" />
      <el-table-column label="省份" align="center" prop="province" min-width="80" />
      <el-table-column label="城市" align="center" prop="city" min-width="80" />
      <el-table-column label="联系电话" align="center" prop="phone" min-width="110" />
      <el-table-column label="面积(㎡)" align="center" prop="areaSize" min-width="80" />
      <el-table-column label="座位数" align="center" prop="seatCount" min-width="70" />
      <el-table-column label="状态" align="center" prop="status" min-width="70">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" min-width="170" />
      <el-table-column label="操作" align="center" min-width="110px" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)" v-hasPermi="['restaurant:store:update']">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['restaurant:store:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <StoreForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as StoreApi from '@/api/restaurant/store'
import StoreForm from './StoreForm.vue'

defineOptions({ name: 'RestaurantStore' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: null,
  status: null
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await StoreApi.getStorePage(queryParams)
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

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await StoreApi.deleteStore(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
