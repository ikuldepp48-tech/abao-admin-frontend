<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="900">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-row>
        <el-col :span="12">
          <el-form-item label="套餐名称" prop="name">
            <el-input v-model="formData.name" placeholder="如：超值双人套餐" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="套餐价" prop="comboPrice">
            <el-input-number v-model="formData.comboPrice" :precision="2" :min="0" class="w-1/1" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="原价合计">
            <el-input-number v-model="formData.originalPrice" :precision="2" :min="0" class="w-1/1" />
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
          <el-form-item label="状态">
            <el-switch v-model="formData.status" :active-value="0" :inactive-value="1" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="支持堂食">
            <el-switch v-model="formData.validForDineIn" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="支持外卖">
            <el-switch v-model="formData.validForTakeout" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="套餐图片">
        <UploadImg v-model="formData.image" directory="combo" />
      </el-form-item>
      <el-form-item label="套餐描述">
        <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="如：含2份主食+2杯饮品" />
      </el-form-item>

      <el-divider content-position="left">套餐明细</el-divider>
      <div style="margin-bottom: 10px">
        <el-button type="primary" size="small" @click="addItem">
          <Icon icon="ep:plus" /> 添加菜品
        </el-button>
        <span class="text-gray-400 ml-10px" style="font-size: 12px">选择SPU后可指定默认SKU</span>
      </div>
      <el-table :data="formData.items" border stripe size="small" style="width: 100%">
        <el-table-column label="菜品(SPU)" min-width="160">
          <template #default="{ row }">
            <el-select v-model="row.spuId" placeholder="选择菜品" size="small" class="w-1/1" @change="(val: number) => onSpuChange(row, val)">
              <el-option v-for="spu in spuList" :key="spu.id" :label="spu.name" :value="spu.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="默认SKU" min-width="130">
          <template #default="{ row }">
            <el-select v-model="row.skuId" placeholder="可选" size="small" class="w-1/1" clearable>
              <el-option v-for="sku in getSkusForSpu(row.spuId)" :key="sku.id" :label="sku.name + ' ¥' + sku.price" :value="sku.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="80">
          <template #default="{ row }">
            <el-input-number v-model="row.quantity" :min="1" size="small" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="额外加价" width="110">
          <template #default="{ row }">
            <el-input-number v-model="row.extraPrice" :precision="2" :min="0" size="small" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="必选" width="70" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.isRequired" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="70">
          <template #default="{ row }">
            <el-input-number v-model="row.sort" :min="0" size="small" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60" align="center">
          <template #default="{ $index }">
            <el-button link type="danger" size="small" @click="removeItem($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { CommonStatusEnum } from '@/utils/constants'
import * as ComboApi from '@/api/restaurant/combo'
import * as DishApi from '@/api/restaurant/dish'

defineOptions({ name: 'RestaurantComboForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const spuList = ref<DishApi.DishVO[]>([])

const emptyItem = (): ComboApi.ComboItemVO => ({
  spuId: undefined as unknown as number,
  skuId: undefined,
  quantity: 1,
  extraPrice: 0,
  isRequired: false,
  sort: 0
})

const formData = ref({
  id: undefined as number | undefined,
  brandId: 3,
  name: '',
  image: '',
  description: '',
  comboPrice: 0,
  originalPrice: undefined as number | undefined,
  sort: 0,
  status: CommonStatusEnum.ENABLE,
  validForDineIn: true,
  validForTakeout: true,
  items: [emptyItem()] as ComboApi.ComboItemVO[]
})
const formRules = reactive({
  name: [{ required: true, message: '套餐名称不能为空', trigger: 'blur' }],
  comboPrice: [{ required: true, message: '套餐价不能为空', trigger: 'blur' }]
})
const formRef = ref()

const loadSpuList = async () => {
  try {
    const data = await DishApi.getSimpleDishList()
    spuList.value = data || []
  } catch {
    spuList.value = []
  }
}

const getSkusForSpu = (spuId: number) => {
  const spu = spuList.value.find((s: any) => s.id === spuId)
  return spu?.skus || []
}

const onSpuChange = (row: ComboApi.ComboItemVO, spuId: number) => {
  row.skuId = undefined
}

const addItem = () => {
  formData.value.items.push(emptyItem())
}

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

defineExpose({
  open: async (type: string, id?: number) => {
    dialogVisible.value = true
    dialogTitle.value = t('action.' + type)
    formType.value = type
    resetForm()
    await loadSpuList()
    if (id) {
      formLoading.value = true
      try {
        const data = await ComboApi.getCombo(id)
        formData.value = {
          id: data.id,
          brandId: data.brandId || 3,
          name: data.name,
          image: data.image || '',
          description: data.description || '',
          comboPrice: data.comboPrice,
          originalPrice: data.originalPrice,
          sort: data.sort || 0,
          status: data.status != null ? data.status : CommonStatusEnum.ENABLE,
          validForDineIn: data.validForDineIn != null ? data.validForDineIn : true,
          validForTakeout: data.validForTakeout != null ? data.validForTakeout : true,
          items: (data.items && data.items.length > 0) ? data.items : [emptyItem()]
        }
      } finally {
        formLoading.value = false
      }
    }
  }
})

const emit = defineEmits(['success'])

const submitForm = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  for (const item of formData.value.items) {
    if (!item.spuId) {
      message.error('请选择套餐明细中的菜品')
      return
    }
  }
  formLoading.value = true
  try {
    const data = { ...formData.value } as unknown as ComboApi.ComboVO
    if (formType.value === 'create') {
      await ComboApi.createCombo(data)
      message.success(t('common.createSuccess'))
    } else {
      await ComboApi.updateCombo(data)
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
    brandId: 3,
    name: '',
    image: '',
    description: '',
    comboPrice: 0,
    originalPrice: undefined,
    sort: 0,
    status: CommonStatusEnum.ENABLE,
    validForDineIn: true,
    validForTakeout: true,
    items: [emptyItem()]
  }
  formRef.value?.resetFields()
}
</script>
