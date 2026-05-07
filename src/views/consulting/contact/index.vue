<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" :inline="true" label-width="80px">
      <el-form-item label="所属客户" prop="clientId">
        <el-select v-model="queryParams.clientId" placeholder="请选择客户" clearable class="!w-200px">
          <el-option v-for="c in clientOptions" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入姓名" clearable @keyup.enter="handleQuery" class="!w-200px" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" @click="openForm('create')" v-hasPermi="['consulting:client-contact:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe show-overflow-tooltip>
      <el-table-column label="编号" align="center" prop="id" width="70" />
      <el-table-column label="姓名" align="center" prop="name" min-width="100" />
      <el-table-column label="角色" align="center" prop="role" width="100" />
      <el-table-column label="手机" align="center" prop="phone" width="130" />
      <el-table-column label="邮箱" align="center" prop="email" width="150" />
      <el-table-column label="微信" align="center" prop="wechat" width="120" />
      <el-table-column label="主联系人" align="center" prop="isPrimary" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.isPrimary === 1" type="success" size="small">是</el-tag>
          <el-tag v-else type="info" size="small">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="170" />
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)" v-hasPermi="['consulting:client-contact:update']">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['consulting:client-contact:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <!-- 新增/编辑弹窗 -->
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="所属客户" prop="clientId">
        <el-select v-model="form.clientId" placeholder="请选择客户" class="w-1/1">
          <el-option v-for="c in clientOptions" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色" class="w-1/1">
          <el-option label="老板" value="老板" />
          <el-option label="总经理" value="总经理" />
          <el-option label="运营总监" value="运营总监" />
          <el-option label="财务总监" value="财务总监" />
          <el-option label="厨师长" value="厨师长" />
          <el-option label="IT负责人" value="IT负责人" />
        </el-select>
      </el-form-item>
      <el-form-item label="手机" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="微信" prop="wechat">
        <el-input v-model="form.wechat" placeholder="请输入微信号" />
      </el-form-item>
      <el-form-item label="主联系人" prop="isPrimary">
        <el-switch v-model="primarySwitch" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import * as ContactApi from '@/api/consulting/contact'
import { getClientSimpleList, type ConsultingClientVO } from '@/api/consulting/client'

defineOptions({ name: 'ConsultingContact' })

const message = useMessage()
const loading = ref(false)
const list = ref<ContactApi.ConsultingContactVO[]>([])
const total = ref(0)
const clientOptions = ref<ConsultingClientVO[]>([])

const queryParams = reactive<ContactApi.ConsultingContactPageReqVO>({
  pageNo: 1,
  pageSize: 10,
  clientId: undefined,
  name: ''
})

const getList = async () => {
  loading.value = true
  try {
    const res = await ContactApi.getContactPage(queryParams)
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const loadClients = async () => {
  clientOptions.value = await getClientSimpleList()
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryParams.clientId = undefined
  queryParams.name = ''
  handleQuery()
}

// 表单
const dialogVisible = ref(false)
const dialogTitle = ref('新增联系人')
const submitting = ref(false)
const formRef = ref()
const form = reactive<ContactApi.ConsultingContactVO>({
  clientId: 0,
  name: '',
  role: '',
  phone: '',
  email: '',
  wechat: '',
  isPrimary: 0,
  remark: ''
})

const primarySwitch = computed({
  get: () => form.isPrimary === 1,
  set: (v) => { form.isPrimary = v ? 1 : 0 }
})

const rules = {
  clientId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

const openForm = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增联系人' : '编辑联系人'
  if (id) {
    const data = await ContactApi.getContact(id)
    Object.assign(form, data)
  } else {
    Object.assign(form, {
      clientId: 0, name: '', role: '', phone: '', email: '',
      wechat: '', isPrimary: 0, remark: '', id: undefined
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
      await ContactApi.updateContact(form)
      message.success('修改成功')
    } else {
      await ContactApi.createContact(form)
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
    await message.confirm('确认删除该联系人？')
    await ContactApi.deleteContact(id)
    message.success('删除成功')
    getList()
  } catch {}
}

onMounted(() => { getList(); loadClients() })
</script>
