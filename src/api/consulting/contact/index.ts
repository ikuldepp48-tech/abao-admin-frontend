import request from '@/config/axios'

export interface ConsultingContactVO {
  id?: number
  clientId: number
  name: string
  role?: string
  phone?: string
  email?: string
  wechat?: string
  isPrimary?: number
  remark?: string
  createTime?: string
}

export interface ConsultingContactPageReqVO {
  pageNo: number
  pageSize: number
  clientId?: number
  name?: string
  role?: string
}

export const getContactPage = async (params: ConsultingContactPageReqVO) => {
  return await request.get({ url: '/consulting/client-contact/page', params })
}

export const getContact = async (id: number): Promise<ConsultingContactVO> => {
  return await request.get({ url: '/consulting/client-contact/get', params: { id } })
}

export const createContact = async (data: ConsultingContactVO) => {
  return await request.post({ url: '/consulting/client-contact/create', data })
}

export const updateContact = async (data: ConsultingContactVO) => {
  return await request.put({ url: '/consulting/client-contact/update', data })
}

export const deleteContact = async (id: number) => {
  return await request.delete({ url: '/consulting/client-contact/delete', params: { id } })
}
