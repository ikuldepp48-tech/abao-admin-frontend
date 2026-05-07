<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" :inline="true" label-width="80px">
      <el-form-item label="项目类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择" clearable class="!w-160px">
          <el-option label="年度顾问" value="年度顾问" />
          <el-option label="项目制" value="项目制" />
          <el-option label="单项咨询" value="单项咨询" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable class="!w-160px">
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="暂停" value="paused" />
        </el-select>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="搜索项目标题" clearable @keyup.enter="handleQuery" class="!w-200px" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" @click="openForm('create')" v-hasPermi="['consulting:engagement:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe show-overflow-tooltip>
      <el-table-column label="编号" align="center" prop="id" width="70" />
      <el-table-column label="项目编码" align="center" prop="code" width="120" />
      <el-table-column label="标题" align="center" prop="title" min-width="140" />
      <el-table-column label="类型" align="center" prop="type" width="100" />
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 'in_progress'" type="success">进行中</el-tag>
          <el-tag v-else-if="scope.row.status === 'completed'" type="info">已完成</el-tag>
          <el-tag v-else type="warning">暂停</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="当前阶段" align="center" width="90">
        <template #default="scope">
          <span class="text-14px font-bold text-blue-500">Phase {{ scope.row.currentPhase ?? 0 }}/6</span>
        </template>
      </el-table-column>
      <el-table-column label="合同金额" align="center" prop="contractAmount" width="110" />
      <el-table-column label="已收款" align="center" prop="paidAmount" width="110" />
      <el-table-column label="开始日期" align="center" prop="startDate" width="110" />
      <el-table-column label="结束日期" align="center" prop="endDate" width="110" />
      <el-table-column label="操作" align="center" min-width="200" fixed="right">
        <template #default="scope">
          <el-button link type="success" @click="handleAdvance(scope.row.id)" v-hasPermi="['consulting:engagement:update']" :disabled="scope.row.status === 'completed'" size="small">推进阶段</el-button>
          <el-button link type="primary" @click="openForm('update', scope.row.id)" v-hasPermi="['consulting:engagement:update']" size="small">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['consulting:engagement:delete']" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <!-- 新增/编辑弹窗 -->
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="700px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入项目标题" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目编码" prop="code">
            <el-input v-model="form.code" placeholder="请输入项目编码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择" class="w-1/1">
              <el-option label="年度顾问" value="年度顾问" />
              <el-option label="项目制" value="项目制" />
              <el-option label="单项咨询" value="单项咨询" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择" class="w-1/1">
              <el-option label="进行中" value="in_progress" />
              <el-option label="已完成" value="completed" />
              <el-option label="暂停" value="paused" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker v-model="form.startDate" type="date" placeholder="开始日期" class="w-1/1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker v-model="form.endDate" type="date" placeholder="结束日期" class="w-1/1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合同金额" prop="contractAmount">
            <el-input-number v-model="form.contractAmount" :min="0" class="w-1/1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="已收款" prop="paidAmount">
            <el-input-number v-model="form.paidAmount" :min="0" class="w-1/1" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="目标" prop="objectives">
            <el-input v-model="form.objectives" type="textarea" :rows="2" placeholder="请输入项目目标" />
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
import * as EngagementApi from '@/api/consulting/engagement'

defineOptions({ name: 'ConsultingEngagement' })

const message = useMessage()
const loading = ref(false)
const list = ref<EngagementApi.ConsultingEngagementVO[]>([])
const total = ref(0)

const queryParams = reactive<EngagementApi.ConsultingEngagementPageReqVO>({
  pageNo: 1,
  pageSize: 10,
  type: '',
  status: '',
  title: ''
})

const getList = async () => {
  loading.value = true
  try {
    const res = await EngagementApi.getEngagementPage(queryParams)
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
  queryParams.type = ''
  queryParams.status = ''
  queryParams.title = ''
  handleQuery()
}

// 表单
const dialogVisible = ref(false)
const dialogTitle = ref('新增项目')
const submitting = ref(false)
const formRef = ref()
const form = reactive<EngagementApi.ConsultingEngagementVO>({
  clientId: 0,
  consultantUserId: undefined,
  code: '',
  title: '',
  type: '',
  status: 'in_progress',
  startDate: '',
  endDate: '',
  contractAmount: undefined,
  paidAmount: undefined,
  objectives: '',
  scope: '',
  constraints: ''
})

const rules = {
  title: [{ required: true, message: '请输入项目标题', trigger: 'blur' }],
  code: [{ required: true, message: '请输入项目编码', trigger: 'blur' }]
}

const openForm = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增项目' : '编辑项目'
  if (id) {
    const data = await EngagementApi.getEngagement(id)
    Object.assign(form, data)
  } else {
    Object.assign(form, {
      clientId: 0, consultantUserId: undefined, code: '', title: '',
      type: '', status: 'in_progress', startDate: '', endDate: '',
      contractAmount: undefined, paidAmount: undefined, objectives: '',
      scope: '', constraints: '', id: undefined
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
      await EngagementApi.updateEngagement(form)
      message.success('修改成功')
    } else {
      await EngagementApi.createEngagement(form)
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
    await message.confirm('确认删除该项目？')
    await EngagementApi.deleteEngagement(id)
    message.success('删除成功')
    getList()
  } catch {}
}

const handleAdvance = async (id: number) => {
  try {
    await message.confirm('确认推进到下一阶段？')
    await EngagementApi.advancePhase(id)
    message.success('阶段推进成功')
    getList()
  } catch {}
}

onMounted(() => getList())
</script>
