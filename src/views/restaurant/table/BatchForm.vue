<template>
  <Dialog title="批量创建桌台" v-model="dialogVisible" width="600">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-form-item label="所属门店" prop="storeId">
        <el-select v-model="formData.storeId" placeholder="请选择门店" class="!w-full">
          <el-option v-for="s in storeList" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="区域">
        <el-input v-model="formData.area" placeholder="如 大厅" />
      </el-form-item>
      <el-form-item label="桌号前缀" prop="prefix">
        <el-input v-model="formData.prefix" placeholder="如 A" class="!w-200px" />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="起始编号" prop="startNo">
            <el-input-number v-model="formData.startNo" :min="1" placeholder="起始编号" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束编号" prop="endNo">
            <el-input-number v-model="formData.endNo" :min="1" placeholder="结束编号" class="!w-full" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="每桌人数" prop="seatCapacity">
        <el-input-number v-model="formData.seatCapacity" :min="1" :max="20" class="!w-200px" />
      </el-form-item>
      <el-alert type="info" :closable="false" show-icon>
        <template #title>
          示例：前缀 A，起始 1，结束 20 → 生成 A01 ~ A20 共 20 张桌台
        </template>
      </el-alert>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">开始批量创建</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import * as TableApi from '@/api/restaurant/table'
import * as StoreApi from '@/api/restaurant/store'

defineOptions({ name: 'RestaurantTableBatchForm' })

const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const storeList = ref([] as any[])

const formData = ref({
  storeId: undefined,
  area: undefined,
  prefix: 'A',
  startNo: 1,
  endNo: 20,
  seatCapacity: 4
})
const formRules = reactive({
  storeId: [{ required: true, message: '所属门店不能为空', trigger: 'change' }],
  prefix: [{ required: true, message: '桌号前缀不能为空', trigger: 'blur' }],
  startNo: [{ required: true, message: '起始编号不能为空', trigger: 'blur' }],
  endNo: [{ required: true, message: '结束编号不能为空', trigger: 'blur' }],
  seatCapacity: [{ required: true, message: '每桌人数不能为空', trigger: 'blur' }]
})
const formRef = ref()

const open = async () => {
  dialogVisible.value = true
  storeList.value = await StoreApi.getSimpleStoreList()
  resetForm()
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const result = await TableApi.batchCreateTable(formData.value)
    message.success(`创建成功 ${result.success} 张桌台，跳过 ${result.skip} 张已存在的`)
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = { storeId: undefined, area: undefined, prefix: 'A', startNo: 1, endNo: 20, seatCapacity: 4 }
  formRef.value?.resetFields()
}
</script>
