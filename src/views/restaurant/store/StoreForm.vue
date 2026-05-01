<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="800">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-row>
        <el-col :span="12">
          <el-form-item label="门店名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入门店名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="门店编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入门店编码" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="所属品牌" prop="brandId">
            <el-select v-model="formData.brandId" placeholder="请选择品牌" class="!w-full">
              <el-option v-for="b in brandList" :key="b.id" :label="b.name" :value="b.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="门店类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择类型" class="!w-full">
              <el-option label="直营" :value="1" />
              <el-option label="加盟" :value="2" />
              <el-option label="联营" :value="3" />
              <el-option label="中央厨房" :value="4" />
              <el-option label="卫星店" :value="5" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="省份" prop="province">
            <el-input v-model="formData.province" placeholder="省份" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="城市" prop="city">
            <el-input v-model="formData.city" placeholder="城市" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="区县" prop="district">
            <el-input v-model="formData.district" placeholder="区县" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="详细地址">
        <el-input v-model="formData.address" placeholder="请输入详细地址" />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="联系电话">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="面积(㎡)">
            <el-input-number v-model="formData.areaSize" :min="0" :precision="2" placeholder="面积" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="座位数">
            <el-input-number v-model="formData.seatCount" :min="0" placeholder="座位数" class="!w-full" />
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
import * as StoreApi from '@/api/restaurant/store'
import * as BrandApi from '@/api/restaurant/brand'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'RestaurantStoreForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const brandList = ref([] as any[])

const formData = ref({
  id: undefined,
  brandId: undefined,
  name: undefined,
  code: undefined,
  type: undefined,
  parentStoreId: undefined,
  province: undefined,
  city: undefined,
  district: undefined,
  address: undefined,
  longitude: undefined,
  latitude: undefined,
  phone: undefined,
  managerUserId: undefined,
  businessHours: undefined,
  status: CommonStatusEnum.ENABLE,
  areaSize: undefined,
  seatCount: undefined
})
const formRules = reactive({
  name: [{ required: true, message: '门店名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '门店编码不能为空', trigger: 'blur' }],
  brandId: [{ required: true, message: '所属品牌不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})
const formRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 加载品牌列表
  brandList.value = await BrandApi.getSimpleBrandList()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await StoreApi.getStore(id)
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
    const data = formData.value as unknown as StoreApi.StoreVO
    if (formType.value === 'create') {
      await StoreApi.createStore(data)
      message.success(t('common.createSuccess'))
    } else {
      await StoreApi.updateStore(data)
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
    id: undefined, brandId: undefined, name: undefined, code: undefined, type: undefined,
    parentStoreId: undefined, province: undefined, city: undefined, district: undefined,
    address: undefined, longitude: undefined, latitude: undefined, phone: undefined,
    managerUserId: undefined, businessHours: undefined, status: CommonStatusEnum.ENABLE,
    areaSize: undefined, seatCount: undefined
  }
  formRef.value?.resetFields()
}
</script>
