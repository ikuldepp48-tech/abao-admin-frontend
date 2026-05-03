<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
      <el-form-item label="套餐名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入套餐名称" clearable @keyup.enter="handleQuery" class="!w-200px" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" @click="openForm('create')" v-hasPermi="['restaurant:dish:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" min-width="60" />
      <el-table-column label="套餐名称" align="center" prop="name" min-width="150" />
      <el-table-column label="套餐价" align="center" prop="comboPrice" min-width="100">
        <template #default="scope">
          ¥{{ scope.row.comboPrice }}
        </template>
      </el-table-column>
      <el-table-column label="原价合计" align="center" prop="originalPrice" min-width="100">
        <template #default="scope">
          ¥{{ scope.row.originalPrice || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="堂食" align="center" prop="validForDineIn" min-width="70">
        <template #default="scope">
          {{ scope.row.validForDineIn !== false ? '支持' : '不支持' }}
        </template>
      </el-table-column>
      <el-table-column label="外卖" align="center" prop="validForTakeout" min-width="70">
        <template #default="scope">
          {{ scope.row.validForTakeout !== false ? '支持' : '不支持' }}
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" min-width="60" />
      <el-table-column label="状态" align="center" prop="status" min-width="70">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" min-width="160" />
      <el-table-column label="操作" align="center" min-width="110px" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)" v-hasPermi="['restaurant:dish:update']">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['restaurant:dish:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <ComboForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as ComboApi from '@/api/restaurant/combo'
import ComboForm from './ComboForm.vue'

defineOptions({ name: 'RestaurantCombo' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: null
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await ComboApi.getComboPage(queryParams)
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
    await ComboApi.deleteCombo(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
