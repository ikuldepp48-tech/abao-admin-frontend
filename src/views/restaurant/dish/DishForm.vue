<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="700">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-row>
        <el-col :span="12">
          <el-form-item label="菜品名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入菜品名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类" prop="categoryId">
            <el-select v-model="formData.categoryId" placeholder="请选择分类" class="w-1/1">
              <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="售价" prop="price">
            <el-input-number v-model="formData.price" :precision="2" :min="0" placeholder="请输入售价" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标记">
            <el-checkbox v-model="formData.isSignature">招牌</el-checkbox>
            <el-checkbox v-model="formData.isNew" class="ml-10px">新品</el-checkbox>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="图片">
        <UploadImg v-model="formData.image" directory="dish" />
      </el-form-item>
      <el-form-item label="简介描述">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入菜品简介（可选）" />
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
import * as DishApi from '@/api/restaurant/dish'
import * as CategoryApi from '@/api/restaurant/category'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'RestaurantDishForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const categoryList = ref([])
const formData = ref({
  id: undefined,
  categoryId: undefined,
  name: undefined,
  price: undefined,
  image: undefined,
  description: undefined,
  isSignature: false,
  isNew: false,
  sort: 0,
  status: CommonStatusEnum.ENABLE
})
const formRules = reactive({
  name: [{ required: true, message: '菜品名称不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '分类不能为空', trigger: 'change' }],
  price: [{ required: true, message: '售价不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})
const formRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  // 加载分类列表
  const cats = await CategoryApi.getSimpleCategoryList()
  categoryList.value = cats
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await DishApi.getDish(id)
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
    const data = formData.value as unknown as DishApi.DishVO
    if (formType.value === 'create') {
      await DishApi.createDish(data)
      message.success(t('common.createSuccess'))
    } else {
      await DishApi.updateDish(data)
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
    categoryId: undefined,
    name: undefined,
    price: undefined,
    image: undefined,
    description: undefined,
    isSignature: false,
    isNew: false,
    sort: 0,
    status: CommonStatusEnum.ENABLE
  }
  formRef.value?.resetFields()
}
</script>
