<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="queryParams.categoryId" placeholder="请选择分类" clearable class="!w-200px">
          <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="菜品名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入菜品名称" clearable @keyup.enter="handleQuery" class="!w-200px" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-200px">
          <el-option v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" @click="openForm('create')" v-hasPermi="['restaurant:dish:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button type="success" plain @click="downloadTemplate" v-hasPermi="['restaurant:dish:query']">
          <Icon icon="ep:download" class="mr-5px" /> 下载导入模板
        </el-button>
        <el-button type="warning" plain @click="openImportDialog" v-hasPermi="['restaurant:dish:create']">
          <Icon icon="ep:upload" class="mr-5px" /> 批量导入
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" min-width="60" />
      <el-table-column label="菜品名称" align="center" prop="name" min-width="140" />
      <el-table-column label="分类" align="center" prop="categoryId" min-width="100">
        <template #default="scope">
          {{ getCategoryName(scope.row.categoryId) }}
        </template>
      </el-table-column>
      <el-table-column label="售价" align="center" prop="price" min-width="100">
        <template #default="scope">
          <span v-if="scope.row.minPrice != null && scope.row.maxPrice != null && scope.row.minPrice !== scope.row.maxPrice">
            ¥{{ scope.row.minPrice }} ~ ¥{{ scope.row.maxPrice }}
          </span>
          <span v-else>¥{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" min-width="60" />
      <el-table-column label="状态" align="center" prop="status" min-width="70">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" min-width="170" />
      <el-table-column label="操作" align="center" min-width="110px" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)" v-hasPermi="['restaurant:dish:update']">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['restaurant:dish:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <DishForm ref="formRef" @success="getList" />

  <!-- 批量导入弹窗 -->
  <Dialog v-model="importDialogVisible" title="批量导入菜品" width="600px">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :auto-upload="false"
      :disabled="importLoading"
      :limit="1"
      :on-exceed="handleExceed"
      accept=".xlsx, .xls"
      action="none"
      drag
    >
      <Icon icon="ep:upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">
          <span>仅允许导入 xls、xlsx 格式文件。</span>
          <el-link :underline="false" style="font-size:12px;vertical-align:baseline" type="primary" @click="downloadTemplate">
            下载模板
          </el-link>
        </div>
      </template>
    </el-upload>

    <!-- 导入结果 -->
    <div v-if="importResult" class="mt-15px">
      <el-alert :type="importResult.failCount > 0 ? 'warning' : 'success'" :closable="false">
        <template #title>
          成功 {{ importResult.successCount }} 条，跳过 {{ importResult.skipCount }} 条，失败 {{ importResult.failCount }} 条
        </template>
      </el-alert>
      <el-table v-if="importResult.failDetails && importResult.failDetails.length > 0" :data="importResult.failDetails" class="mt-10px" max-height="300" stripe>
        <el-table-column label="Sheet" prop="sheet" min-width="90" />
        <el-table-column label="行号" prop="row" min-width="60" align="center" />
        <el-table-column label="菜品名" prop="name" min-width="120" />
        <el-table-column label="失败原因" prop="reason" min-width="200" />
      </el-table>
    </div>

    <template #footer>
      <el-button @click="importDialogVisible = false">取消</el-button>
      <el-button :disabled="importLoading" type="primary" @click="submitImport">开始导入</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as DishApi from '@/api/restaurant/dish'
import * as CategoryApi from '@/api/restaurant/category'
import DishForm from './DishForm.vue'
import download from '@/utils/download'
import type { UploadUserFile } from 'element-plus'

defineOptions({ name: 'RestaurantDish' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref([])
const total = ref(0)
const categoryList = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  categoryId: null,
  name: null,
  status: null
})
const queryFormRef = ref()

const getCategoryList = async () => {
  const data = await CategoryApi.getSimpleCategoryList()
  categoryList.value = data
}

const getCategoryName = (categoryId: number) => {
  const cat = categoryList.value.find((c: any) => c.id === categoryId)
  return cat ? cat.name : '-'
}

const getList = async () => {
  loading.value = true
  try {
    const data = await DishApi.getDishPage(queryParams)
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
    await DishApi.deleteDish(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

// ========== 批量导入 ==========
const importDialogVisible = ref(false)
const importLoading = ref(false)
const uploadRef = ref()
const fileList = ref<UploadUserFile[]>([])
const importResult = ref<DishApi.ImportResultVO | null>(null)

const downloadTemplate = async () => {
  const res = await DishApi.downloadDishImportTemplate()
  download.excel(res, '菜品导入模板.xlsx')
}

const openImportDialog = () => {
  importResult.value = null
  fileList.value = []
  nextTick(() => uploadRef.value?.clearFiles())
  importDialogVisible.value = true
}

const submitImport = async () => {
  if (fileList.value.length === 0) {
    message.error('请上传文件')
    return
  }
  importLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', fileList.value[0].raw as Blob)
    const res = await DishApi.importDishes(formData)
    const result = res.data as DishApi.ImportResultVO
    importResult.value = result
    if (result.successCount > 0) {
      await getList()
      message.success(`导入完成：成功 ${result.successCount} 条，跳过 ${result.skipCount} 条，失败 ${result.failCount} 条`)
    } else {
      message.warning(`导入完成：成功 0 条，跳过 ${result.skipCount} 条，失败 ${result.failCount} 条`)
    }
  } catch {
    message.error('导入失败，请重新上传')
  } finally {
    importLoading.value = false
  }
}

const handleExceed = () => {
  message.error('最多只能上传一个文件！')
}

onMounted(() => {
  getCategoryList()
  getList()
})
</script>
