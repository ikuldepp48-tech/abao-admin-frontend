import request from '@/config/axios'

export interface ConsultingClientVO {
  id?: number
  tenantId?: number
  name: string
  shortName?: string
  industry?: string
  status?: number
  consultantUserId?: number
  legalPerson?: string
  foundedDate?: string
  registeredCapital?: number
  employeeCountRange?: string
  monthlyRevenueRange?: string
  storeCount?: number
  businessModel?: string
  posSystem?: string
  financeSystem?: string
  crmSystem?: string
  itRemark?: string
  serviceStartDate?: string
  serviceEndDate?: string
  serviceType?: string
  annualFee?: number
  serviceStatus?: number
  keyPainPoints?: string
  coreDemands?: string
  remark?: string
  createTime?: string
}

export interface ConsultingClientPageReqVO {
  pageNo: number
  pageSize: number
  name?: string
  shortName?: string
  industry?: string
  status?: number
  consultantUserId?: number
}

export const getClientPage = async (params: ConsultingClientPageReqVO) => {
  return await request.get({ url: '/consulting/client/page', params })
}

export const getClient = async (id: number): Promise<ConsultingClientVO> => {
  return await request.get({ url: '/consulting/client/get', params: { id } })
}

export const getClientSimpleList = async (): Promise<ConsultingClientVO[]> => {
  return await request.get({ url: '/consulting/client/list-all-simple' })
}

export const createClient = async (data: ConsultingClientVO) => {
  return await request.post({ url: '/consulting/client/create', data })
}

export const updateClient = async (data: ConsultingClientVO) => {
  return await request.put({ url: '/consulting/client/update', data })
}

export const deleteClient = async (id: number) => {
  return await request.delete({ url: '/consulting/client/delete', params: { id } })
}
