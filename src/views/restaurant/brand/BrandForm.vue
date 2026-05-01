<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="700">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-row>
        <el-col :span="12">
          <el-form-item label="品牌名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入品牌名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="品牌编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入品牌编码（如 abao）" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="品类" prop="category">
            <el-input v-model="formData.category" placeholder="如：中式快餐" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="品牌Logo">
        <el-input v-model="formData.logo" placeholder="请输入Logo URL" />
      </el-form-item>
      <el-form-item label="品牌简介">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入品牌简介" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as BrandApi from '@/api/restaurant/brand'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'RestaurantBrandForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref({
  id: undefined,
  name: undefined,
  code: undefined,
  logo: undefined,
  description: undefined,
  category: undefined,
  status: CommonStatusEnum.ENABLE
})
const formRules = reactive({
  name: [{ required: true, message: '品牌名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '品牌编码不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})
const formRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await BrandApi.getBrand(id)
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
    const data = formData.value as unknown as BrandApi.BrandVO
    if (formType.value === 'create') {
      await BrandApi.createBrand(data)
      message.success(t('common.createSuccess'))
    } else {
      await BrandApi.updateBrand(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    code: undefined,
    logo: undefined,
    description: undefined,
    category: undefined,
    status: CommonStatusEnum.ENABLE
  }
  formRef.value?.resetFields()
}
</script>
