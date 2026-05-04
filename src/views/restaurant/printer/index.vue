<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
      <el-form-item label="打印机名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入打印机名称" clearable @keyup.enter="handleQuery" class="!w-240px" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable class="!w-240px">
          <el-option label="厨打" :value="1" />
          <el-option label="客联" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" @click="openForm('create')" v-hasPermi="['restaurant:printer:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true" row-key="id">
      <el-table-column label="编号" align="center" prop="id" min-width="60" />
      <el-table-column label="打印机名称" align="center" prop="name" min-width="120" />
      <el-table-column label="类型" align="center" prop="type" min-width="80">
        <template #default="scope">
          <el-tag :type="scope.row.type === 1 ? 'warning' : 'info'">{{ scope.row.type === 1 ? '厨打' : '客联' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="厂商" align="center" prop="provider" min-width="100" />
      <el-table-column label="设备号" align="center" prop="deviceNo" min-width="140" />
      <el-table-column label="状态" align="center" prop="status" min-width="70">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">{{ scope.row.status === 1 ? '在线' : '离线' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" min-width="170" />
      <el-table-column label="操作" align="center" min-width="110px" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)" v-hasPermi="['restaurant:printer:update']">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['restaurant:printer:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <!-- 新增/编辑对话框 -->
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="520px" @close="resetForm">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入打印机名称" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio :value="1">厨打</el-radio>
          <el-radio :value="2">客联</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="厂商" prop="provider">
        <el-select v-model="formData.provider" placeholder="选择厂商" class="!w-240px">
          <el-option label="Mock（开发用）" value="mock" />
          <el-option label="飞鹅云" value="feieyun" />
          <el-option label="易联云" value="yiliantong" />
          <el-option label="芯烨云" value="xinye" />
        </el-select>
      </el-form-item>
      <el-form-item label="设备号" prop="deviceNo">
        <el-input v-model="formData.deviceNo" placeholder="云打印机设备号" />
      </el-form-item>
      <el-form-item label="设备密钥" prop="deviceKey">
        <el-input v-model="formData.deviceKey" placeholder="云打印机设备密钥" />
      </el-form-item>
      <el-form-item label="所属门店" prop="storeId">
        <el-input v-model="formData.storeId" placeholder="门店ID" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="1">在线</el-radio>
          <el-radio :value="0">离线</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import * as PrinterApi from '@/api/restaurant/printer'

defineOptions({ name: 'RestaurantPrinter' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: null,
  type: null
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await PrinterApi.getPrinterPage(queryParams)
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

// 新增/编辑
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const formRef = ref()
const isUpdate = ref(false)
const updateId = ref<number>()

const formData = reactive({
  name: '',
  type: 1,
  provider: 'mock',
  deviceNo: '',
  deviceKey: '',
  storeId: undefined as number | undefined,
  status: 1
})

const formRules = {
  name: [{ required: true, message: '请输入打印机名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  provider: [{ required: true, message: '请选择厂商', trigger: 'change' }],
  deviceNo: [{ required: true, message: '请输入设备号', trigger: 'blur' }],
  deviceKey: [{ required: true, message: '请输入设备密钥', trigger: 'blur' }]
}

const resetForm = () => {
  formRef.value?.resetFields()
  isUpdate.value = false
  updateId.value = undefined
}

const openForm = async (type: string, id?: number) => {
  resetForm()
  if (type === 'update' && id) {
    dialogTitle.value = '编辑打印机'
    isUpdate.value = true
    updateId.value = id
    try {
      const data = await PrinterApi.getPrinter(id)
      Object.assign(formData, data)
    } catch {}
  } else {
    dialogTitle.value = '新增打印机'
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isUpdate.value) {
      await PrinterApi.updatePrinter({ ...formData, id: updateId.value })
      message.success(t('common.updateSuccess'))
    } else {
      await PrinterApi.createPrinter({ ...formData })
      message.success(t('common.createSuccess'))
    }
    dialogVisible.value = false
    await getList()
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await PrinterApi.deletePrinter(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
