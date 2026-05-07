<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" :inline="true" label-width="80px">
      <el-form-item label="客户名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入客户名称" clearable @keyup.enter="handleQuery" class="!w-200px" />
      </el-form-item>
      <el-form-item label="行业" prop="industry">
        <el-select v-model="queryParams.industry" placeholder="请选择行业" clearable class="!w-200px">
          <el-option v-for="item in industryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" @click="openForm('create')" v-hasPermi="['consulting:client:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe show-overflow-tooltip>
      <el-table-column label="编号" align="center" prop="id" width="70" />
      <el-table-column label="客户名称" align="center" prop="name" min-width="120" />
      <el-table-column label="简称" align="center" prop="shortName" width="100" />
      <el-table-column label="行业" align="center" prop="industry" width="100" />
      <el-table-column label="服务类型" align="center" prop="serviceType" width="100" />
      <el-table-column label="年费(元)" align="center" prop="annualFee" width="100" />
      <el-table-column label="服务状态" align="center" prop="serviceStatus" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.serviceStatus === 1" type="success">服务中</el-tag>
          <el-tag v-else-if="scope.row.serviceStatus === 2" type="warning">暂停</el-tag>
          <el-tag v-else-if="scope.row.serviceStatus === 3" type="info">已结束</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="170" />
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)" v-hasPermi="['consulting:client:update']">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['consulting:client:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <!-- 新增/编辑弹窗 -->
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="650px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入客户名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="简称" prop="shortName">
            <el-input v-model="form.shortName" placeholder="请输入简称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="行业" prop="industry">
            <el-select v-model="form.industry" placeholder="请选择行业" class="w-1/1">
              <el-option v-for="item in industryOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="法人代表" prop="legalPerson">
            <el-input v-model="form.legalPerson" placeholder="请输入法人代表" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="成立日期" prop="foundedDate">
            <el-date-picker v-model="form.foundedDate" type="date" placeholder="请选择成立日期" class="w-1/1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="注册资本(万)" prop="registeredCapital">
            <el-input-number v-model="form.registeredCapital" :min="0" class="w-1/1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="门店数量" prop="storeCount">
            <el-input-number v-model="form.storeCount" :min="0" class="w-1/1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="服务类型" prop="serviceType">
            <el-select v-model="form.serviceType" placeholder="请选择服务类型" class="w-1/1">
              <el-option label="年度顾问" value="年度顾问" />
              <el-option label="项目制" value="项目制" />
              <el-option label="单项咨询" value="单项咨询" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年费(元)" prop="annualFee">
            <el-input-number v-model="form.annualFee" :min="0" class="w-1/1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="服务开始" prop="serviceStartDate">
            <el-date-picker v-model="form.serviceStartDate" type="date" placeholder="服务开始日期" class="w-1/1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="服务结束" prop="serviceEndDate">
            <el-date-picker v-model="form.serviceEndDate" type="date" placeholder="服务结束日期" class="w-1/1" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="核心痛点" prop="keyPainPoints">
            <el-input v-model="form.keyPainPoints" type="textarea" :rows="2" placeholder="请输入核心痛点" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="核心需求" prop="coreDemands">
            <el-input v-model="form.coreDemands" type="textarea" :rows="2" placeholder="请输入核心需求" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import * as ClientApi from '@/api/consulting/client'

defineOptions({ name: 'ConsultingClient' })

const message = useMessage()
const loading = ref(false)
const list = ref<ClientApi.ConsultingClientVO[]>([])
const total = ref(0)

const queryParams = reactive<ClientApi.ConsultingClientPageReqVO>({
  pageNo: 1,
  pageSize: 10,
  name: '',
  industry: ''
})

const industryOptions = [
  { label: '中餐', value: '中餐' },
  { label: '西餐', value: '西餐' },
  { label: '快餐', value: '快餐' },
  { label: '火锅', value: '火锅' },
  { label: '奶茶饮品', value: '奶茶饮品' },
  { label: '烘焙甜品', value: '烘焙甜品' },
  { label: '烧烤', value: '烧烤' }
]

const getList = async () => {
  loading.value = true
  try {
    const res = await ClientApi.getClientPage(queryParams)
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryParams.name = ''
  queryParams.industry = ''
  handleQuery()
}

// 表单
const dialogVisible = ref(false)
const dialogTitle = ref('新增客户')
const submitting = ref(false)
const formRef = ref()
const form = reactive<ClientApi.ConsultingClientVO>({
  name: '',
  shortName: '',
  industry: '',
  legalPerson: '',
  foundedDate: '',
  registeredCapital: undefined,
  storeCount: undefined,
  serviceType: '',
  annualFee: undefined,
  serviceStartDate: '',
  serviceEndDate: '',
  keyPainPoints: '',
  coreDemands: '',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }]
}

const openForm = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增客户' : '编辑客户'
  if (id) {
    const data = await ClientApi.getClient(id)
    Object.assign(form, data)
  } else {
    Object.assign(form, {
      name: '', shortName: '', industry: '', legalPerson: '',
      foundedDate: '', registeredCapital: undefined, storeCount: undefined,
      serviceType: '', annualFee: undefined, serviceStartDate: '', serviceEndDate: '',
      keyPainPoints: '', coreDemands: '', remark: '', id: undefined
    })
  }
}

const submitForm = async () => {
  try {
    await formRef.value?.validate()
  } catch { return }
  submitting.value = true
  try {
    if (form.id) {
      await ClientApi.updateClient(form)
      message.success('修改成功')
    } else {
      await ClientApi.createClient(form)
      message.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await message.confirm('确认删除该客户？')
    await ClientApi.deleteClient(id)
    message.success('删除成功')
    getList()
  } catch {}
}

onMounted(() => getList())
</script>
