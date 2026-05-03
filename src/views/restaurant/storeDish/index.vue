<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
      <el-form-item label="门店" prop="storeId">
        <el-select v-model="queryParams.storeId" placeholder="选择门店" clearable class="!w-200px" @change="handleQuery">
          <el-option v-for="s in storeList" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="选择状态" clearable class="!w-200px">
          <el-option v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <div class="mb-10px">
      <el-button type="danger" @click="handleBatchSoldOut" :disabled="selectedIds.length === 0" v-hasPermi="['restaurant:dish:update']">
        一键沽清
      </el-button>
      <el-button type="success" @click="handleBatchRestore" :disabled="selectedIds.length === 0" v-hasPermi="['restaurant:dish:update']">
        批量恢复
      </el-button>
    </div>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="45" align="center" />
      <el-table-column label="编号" align="center" prop="id" min-width="60" />
      <el-table-column label="菜品(SPU)" align="center" min-width="140">
        <template #default="scope">
          {{ spuNameMap[scope.row.spuId] || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="门店价" align="center" min-width="120">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.price"
            :precision="2"
            :min="0"
            size="small"
            controls-position="right"
            @change="(val: number | undefined) => handlePriceChange(scope.row.id, val)"
          />
        </template>
      </el-table-column>
      <el-table-column label="每日限量" align="center" min-width="120">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.dailyLimit"
            :min="0"
            size="small"
            controls-position="right"
            @change="(val: number | undefined) => handleLimitChange(scope.row.id, val)"
          />
          <span class="text-gray-400 ml-5px" style="font-size: 11px">0=不限</span>
        </template>
      </el-table-column>
      <el-table-column label="今日已售" align="center" prop="todaySold" min-width="80">
        <template #default="scope">
          {{ scope.row.todaySold || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="沽清" align="center" prop="isSoldOut" min-width="70">
        <template #default="scope">
          <el-tag v-if="scope.row.isSoldOut" type="danger" size="small">已沽清</el-tag>
          <el-tag v-else type="success" size="small">正常</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" min-width="70">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" min-width="60" />
    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as StoreDishApi from '@/api/restaurant/storeDish'
import * as StoreApi from '@/api/restaurant/store'
import * as DishApi from '@/api/restaurant/dish'

defineOptions({ name: 'RestaurantStoreDish' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref([])
const total = ref(0)
const selectedIds = ref<number[]>([])
const storeList = ref<StoreApi.StoreVO[]>([])
const spuNameMap = ref<Record<number, string>>({})

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  storeId: null,
  status: null
})
const queryFormRef = ref()

const loadStoreList = async () => {
  try {
    const data = await StoreApi.getSimpleStoreList()
    storeList.value = data || []
  } catch {
    storeList.value = []
  }
}

const loadSpuNames = async () => {
  try {
    const dishes = await DishApi.getSimpleDishList()
    const map: Record<number, string> = {}
    for (const d of dishes) {
      map[d.id] = d.name
    }
    spuNameMap.value = map
  } catch {}
}

const getList = async () => {
  loading.value = true
  try {
    const data = await StoreDishApi.getStoreDishPage(queryParams)
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

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item: any) => item.id)
}

const handlePriceChange = async (id: number, price: number | undefined) => {
  if (price == null) return
  try {
    await StoreDishApi.overridePrice(id, price)
    message.success('价格已更新')
  } catch {}
}

const handleLimitChange = async (id: number, dailyLimit: number | undefined) => {
  if (dailyLimit == null) return
  try {
    await StoreDishApi.setDailyLimit(id, dailyLimit)
    message.success('每日限量已更新')
  } catch {}
}

const handleBatchSoldOut = async () => {
  try {
    await message.confirm('确认将选中菜品一键沽清？')
    await StoreDishApi.batchSoldOut(selectedIds.value)
    message.success(t('common.updateSuccess'))
    selectedIds.value = []
    await getList()
  } catch {}
}

const handleBatchRestore = async () => {
  try {
    await message.confirm('确认恢复选中菜品供应？')
    await StoreDishApi.batchRestore(selectedIds.value)
    message.success(t('common.updateSuccess'))
    selectedIds.value = []
    await getList()
  } catch {}
}

onMounted(async () => {
  await Promise.all([loadStoreList(), loadSpuNames()])
  getList()
})
</script>
