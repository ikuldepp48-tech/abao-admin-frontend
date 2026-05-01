<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-row>
        <el-col :span="12">
          <el-form-item label="所属门店" prop="storeId">
            <el-select v-model="formData.storeId" placeholder="请选择门店" class="!w-full">
              <el-option v-for="s in storeList" :key="s.id" :label="s.name" :value="s.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="桌号" prop="tableNo">
            <el-input v-model="formData.tableNo" placeholder="如 A01" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="区域">
            <el-input v-model="formData.area" placeholder="如 大厅/包厢/二楼" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="座位数" prop="seatCapacity">
            <el-input-number v-model="formData.seatCapacity" :min="1" :max="20" placeholder="座位数" class="!w-full" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="0">空闲</el-radio>
          <el-radio :value="1">用餐中</el-radio>
          <el-radio :value="2">待结账</el-radio>
          <el-radio :value="3">已锁定</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import * as TableApi from '@/api/restaurant/table'
import * as StoreApi from '@/api/restaurant/store'

defineOptions({ name: 'RestaurantTableForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const storeList = ref([] as any[])

const formData = ref({
  id: undefined,
  storeId: undefined,
  area: undefined,
  tableNo: undefined,
  seatCapacity: 4,
  status: 0
})
const formRules = reactive({
  storeId: [{ required: true, message: '所属门店不能为空', trigger: 'change' }],
  tableNo: [{ required: true, message: '桌号不能为空', trigger: 'blur' }],
  seatCapacity: [{ required: true, message: '座位数不能为空', trigger: 'blur' }]
})
const formRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  storeList.value = await StoreApi.getSimpleStoreList()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await TableApi.getTable(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const data = formData.value as unknown as TableApi.TableVO
    if (formType.value === 'create') {
      await TableApi.createTable(data)
      message.success(t('common.createSuccess'))
    } else {
      await TableApi.updateTable(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = { id: undefined, storeId: undefined, area: undefined, tableNo: undefined, seatCapacity: 4, status: 0 }
  formRef.value?.resetFields()
}
</script>
