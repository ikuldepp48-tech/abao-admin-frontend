import request from '@/config/axios'

export interface DeliverableItem {
  name: string
  status: 'pending' | 'submitted' | 'accepted'
  dueDate: string
}

export interface ConsultingEngagementVO {
  id?: number
  tenantId?: number
  clientId: number
  consultantUserId?: number
  code: string
  title: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
  actualEndDate?: string
  contractAmount?: number
  paidAmount?: number
  currentPhase?: number
  objectives?: string
  scope?: string
  constraints?: string
  deliverables?: DeliverableItem[]
  phase1DoneAt?: string
  phase2DoneAt?: string
  phase3DoneAt?: string
  phase4DoneAt?: string
  phase5DoneAt?: string
  phase6DoneAt?: string
  createTime?: string
}

export interface ConsultingEngagementPageReqVO {
  pageNo: number
  pageSize: number
  clientId?: number
  type?: string
  status?: string
  currentPhase?: number
  title?: string
}

export const getEngagementPage = async (params: ConsultingEngagementPageReqVO) => {
  return await request.get({ url: '/consulting/engagement/page', params })
}

export const getEngagement = async (id: number): Promise<ConsultingEngagementVO> => {
  return await request.get({ url: '/consulting/engagement/get', params: { id } })
}

export const createEngagement = async (data: ConsultingEngagementVO) => {
  return await request.post({ url: '/consulting/engagement/create', data })
}

export const updateEngagement = async (data: ConsultingEngagementVO) => {
  return await request.put({ url: '/consulting/engagement/update', data })
}

export const deleteEngagement = async (id: number) => {
  return await request.delete({ url: '/consulting/engagement/delete', params: { id } })
}

export const advancePhase = async (id: number) => {
  return await request.put({ url: '/consulting/engagement/advance-phase', params: { id } })
}
