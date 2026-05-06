import request from '@/config/axios'

export interface DashboardSummaryVO {
  totalClients: number
  activeEngagements: number
  completedEngagements: number
  totalContractAmount: number
  totalPaidAmount: number
}

export interface ClientRankingItemVO {
  clientId: number
  clientName: string
  score: number
  communicationScore: number
  projectScore: number
  contractScore: number
  healthLevel: string
  urgentAction: string
  warnings: string[]
  avgScore: number
}

export interface UrgentTodoItemVO {
  type: string
  title: string
  clientId: number
  clientName: string
  priority: string
  deadline: string
  daysRemaining: number
  detail: string
  actions: string[]
}

export interface WeekScheduleItemVO {
  date: string
  time: string
  type: string
  title: string
  clientId: number
  clientName: string
  engagementId: number
  engagementTitle: string
}

export interface ClientPanoramaVO {
  clientId: number
  clientName: string
  shortName: string
  industry: string
  score: number
  healthLevel: string
  activeEngagementCount: number
  engagementTitles: string[]
  storeCount: number
  status: number
  avgScore: number
}

// ==================== API ====================

export const getDashboardSummary = async (): Promise<DashboardSummaryVO> => {
  return await request.get({ url: '/consulting/dashboard/summary' })
}

export const getClientRanking = async (): Promise<ClientRankingItemVO[]> => {
  return await request.get({ url: '/consulting/dashboard/client-ranking' })
}

export const getUrgentTodos = async (): Promise<UrgentTodoItemVO[]> => {
  return await request.get({ url: '/consulting/dashboard/urgent-todos' })
}

export const getWeekSchedule = async (): Promise<WeekScheduleItemVO[]> => {
  return await request.get({ url: '/consulting/dashboard/week-schedule' })
}

export const getClientPanorama = async (): Promise<ClientPanoramaVO[]> => {
  return await request.get({ url: '/consulting/dashboard/client-panorama' })
}
