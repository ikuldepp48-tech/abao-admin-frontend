<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
      <el-form-item label="加料组" prop="groupName">
        <el-input v-model="queryParams.groupName" placeholder="请输入加料组名称" clearable @keyup.enter="handleQuery" class="!w-200px" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入加料名称" clearable @keyup.enter="handleQuery" class="!w-200px" />
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
      <el-table-column label="加料组" align="center" prop="groupName" min-width="100" />
      <el-table-column label="加料名称" align="center" prop="name" min-width="140" />
      <el-table-column label="加价" align="center" prop="extraPrice" min-width="80">
        <template #default="scope">
          ¥{{ scope.row.extraPrice || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="必选" align="center" prop="isRequired" min-width="70">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.isRequired ? 'true' : 'false'" />
        </template>
      </el-table-column>
      <el-table-column label="多选" align="center" prop="isMulti" min-width="70">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.isMulti ? 'true' : 'false'" />
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

  <!-- 新增/编辑对话框 -->
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="550">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-row>
        <el-col :span="12">
          <el-form-item label="加料组" prop="groupName">
            <el-input v-model="formData.groupName" placeholder="如：辣度、加料、做法" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="加料名称" prop="name">
            <el-input v-model="formData.name" placeholder="如：中辣、加蛋+2元" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="加价(元)" prop="extraPrice">
            <el-input-number v-model="formData.extraPrice" :precision="2" :min="0" class="w-1/1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="必选">
            <el-switch v-model="formData.isRequired" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="多选">
            <el-switch v-model="formData.isMulti" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态" prop="status">
            <el-switch v-model="formData.status" :active-value="0" :inactive-value="1" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as AddonApi from '@/api/restaurant/dishAddon'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'RestaurantDishAddon' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  groupName: null,
  name: null
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await AddonApi.getAddonPage(queryParams)
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

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref({
  id: undefined,
  brandId: 3,
  groupName: '',
  name: '',
  extraPrice: 0,
  isRequired: false,
  isMulti: false,
  sort: 0,
  status: CommonStatusEnum.ENABLE
})
const formRules = reactive({
  groupName: [{ required: true, message: '加料组不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '加料名称不能为空', trigger: 'blur' }]
})
const formRef = ref()

const openForm = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      const data = await AddonApi.getAddon(id)
      formData.value = { ...data }
    } finally {
      formLoading.value = false
    }
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    brandId: 3,
    groupName: '',
    name: '',
    extraPrice: 0,
    isRequired: false,
    isMulti: false,
    sort: 0,
    status: CommonStatusEnum.ENABLE
  }
  formRef.value?.resetFields()
}

const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const data = formData.value as unknown as AddonApi.AddonVO
    if (formType.value === 'create') {
      await AddonApi.createAddon(data)
      message.success(t('common.createSuccess'))
    } else {
      await AddonApi.updateAddon(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    getList()
  } finally {
    formLoading.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await AddonApi.deleteAddon(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
