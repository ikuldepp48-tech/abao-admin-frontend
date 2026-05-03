<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="800">
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
          <el-form-item label="展示售价" prop="price">
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

      <!-- SKU 规格管理 -->
      <el-divider content-position="left">商品规格 (SKU)</el-divider>
      <div style="margin-bottom: 10px">
        <el-button type="primary" size="small" @click="addSku">
          <Icon icon="ep:plus" /> 添加规格
        </el-button>
        <span class="text-gray-400 ml-10px" style="font-size: 12px">至少添加一个规格，如"大碗"、"小碗"</span>
      </div>
      <el-table :data="formData.skus" border stripe size="small" style="width: 100%">
        <el-table-column label="规格名称" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.name" placeholder="如：大碗" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="售价" width="150">
          <template #default="{ row }">
            <el-input-number v-model="row.price" :precision="2" :min="0.01" size="small" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="0" :inactive-value="1" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="70" align="center">
          <template #default="{ $index }">
            <el-button link type="danger" size="small" @click="removeSku($index)" :disabled="formData.skus.length <= 1">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="formData.minPrice != null" class="mt-10px" style="font-size: 12px; color: #909399">
        价格区间：¥{{ formData.minPrice }} ~ ¥{{ formData.maxPrice }}
      </div>

      <!-- 加料配置 -->
      <el-divider content-position="left">加料配置</el-divider>
      <div v-if="addonGroups.length === 0" class="text-gray-400" style="font-size: 12px; padding: 10px 0">
        暂无可用的加料组，请先在"加料管理"中添加
      </div>
      <div v-for="group in addonGroups" :key="group.groupName" style="margin-bottom: 8px">
        <el-checkbox
          :model-value="checkedGroups.includes(group.groupName)"
          @change="(val: boolean) => toggleGroup(group.groupName, val)"
        >
          {{ group.groupName }}
          <span class="text-gray-400" style="font-size: 12px">
            （{{ group.items.length }}项：{{ group.items.map((a: any) => a.name).join(' / ') }}）
          </span>
        </el-checkbox>
      </div>
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
import * as AddonApi from '@/api/restaurant/dishAddon'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'RestaurantDishForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const categoryList = ref([])
const addonGroups = ref<{ groupName: string; items: AddonApi.AddonVO[] }[]>([])
const checkedGroups = ref<string[]>([])

const toggleGroup = (groupName: string, val: boolean) => {
  if (val) {
    checkedGroups.value.push(groupName)
  } else {
    checkedGroups.value = checkedGroups.value.filter(g => g !== groupName)
  }
}

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
  status: CommonStatusEnum.ENABLE,
  minPrice: undefined,
  maxPrice: undefined,
  skus: [] as DishApi.SkuVO[]
})
const formRules = reactive({
  name: [{ required: true, message: '菜品名称不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '分类不能为空', trigger: 'change' }]
})
const formRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 并行加载分类和加料
  const [cats, addons] = await Promise.all([
    CategoryApi.getSimpleCategoryList(),
    AddonApi.getAddonListByBrand(1).catch(() => [] as AddonApi.AddonVO[])
  ])
  categoryList.value = cats
  buildAddonGroups(addons)
  if (id) {
    formLoading.value = true
    try {
      const data = await DishApi.getDish(id)
      formData.value = {
        id: data.id,
        categoryId: data.categoryId,
        name: data.name,
        price: data.price,
        image: data.image,
        description: data.description,
        isSignature: data.isSignature,
        isNew: data.isNew,
        sort: data.sort,
        status: data.status,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        skus: (data.skus || []).map((sku: any) => ({
          id: sku.id,
          spuId: sku.spuId,
          name: sku.name || '',
          price: sku.price || 0,
          status: sku.status != null ? sku.status : CommonStatusEnum.ENABLE
        }))
      }
      // 回填已关联的加料组
      checkedGroups.value = data.addonGroupNames || []
    } finally {
      formLoading.value = false
    }
  }
}
const buildAddonGroups = (addons: AddonApi.AddonVO[]) => {
  const map = new Map<string, AddonApi.AddonVO[]>()
  for (const a of addons) {
    if (!map.has(a.groupName)) map.set(a.groupName, [])
    map.get(a.groupName)!.push(a)
  }
  addonGroups.value = Array.from(map.entries()).map(([groupName, items]) => ({ groupName, items }))
}

defineExpose({ open })

const addSku = () => {
  formData.value.skus.push({
    name: '',
    price: 0,
    status: CommonStatusEnum.ENABLE
  })
}

const removeSku = (index: number) => {
  if (formData.value.skus.length > 1) {
    formData.value.skus.splice(index, 1)
  }
}

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  // 简单校验SKU
  if (!formData.value.skus || formData.value.skus.length === 0) {
    message.error('请至少添加一个规格(SKU)')
    return
  }
  for (const sku of formData.value.skus) {
    if (!sku.name || !sku.name.trim()) {
      message.error('请填写所有规格名称')
      return
    }
    if (!sku.price || sku.price <= 0) {
      message.error('规格"' + sku.name + '"的售价必须大于0')
      return
    }
  }
  formLoading.value = true
  try {
    const data = { ...formData.value, addonGroupNames: checkedGroups.value } as unknown as DishApi.DishVO
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
    status: CommonStatusEnum.ENABLE,
    minPrice: undefined,
    maxPrice: undefined,
    skus: [{ name: '', price: 0, status: CommonStatusEnum.ENABLE }]
  }
  checkedGroups.value = []
  addonGroups.value = []
  formRef.value?.resetFields()
}
</script>
