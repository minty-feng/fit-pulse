// service.ts
import axios from 'axios'
import { message, Modal } from 'antd'
import type { Dayjs } from 'dayjs'

// 类型定义
interface ApiResponse<T = any> {
  code: number
  data: T
  msg?: string
}

interface WeightRecord {
  id: string
  date: string
  weight: number
  submittedAt: string
  updatedAt: string
}

// Axios 实例
const instance = axios.create({
  timeout: 30000,
  baseURL: 'http://localhost:8000',
  headers: {
    'X-Custom-Header': 'weight-manager',
    'Content-Type': 'application/json' // 默认 JSON 格式
  }
})

// 请求拦截器
instance.interceptors.request.use(config => {
  // 自动添加时间戳（GET 参数 / POST 数据）
  if (config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() }
  } else {
    config.data = { ...config.data, _t: Date.now() }
  }
  return config
})

// 响应拦截器
instance.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 0) {
      const error = new Error(res.msg || '操作失败')
      return Promise.reject(error)
    }
    return res.data
  },
  error => {
    const errorMsg = error.response?.data?.msg || error.message
    handleError(errorMsg)
    return Promise.reject(error)
  }
)

// 错误处理
const errorHandler = (msg: string) => {
  message.destroy()
  message.error(msg)
}

function handleError(error: string) {
  if (/权限/i.test(error)) {
    Modal.error({ 
      title: '权限不足',
      content: '请联系管理员申请权限',
      okText: '去申请'
    })
  } else {
    errorHandler(error)
  }
}

// API 服务
export const WeightService = {
  async getRecords(params: { page?: number; size?: number }) {
    return instance.get<{ list: WeightRecord[]; total: number }>(
      '/api/weight/records',
      { params }
    )
  },

  async createRecord(data: { date: Dayjs; weight: number }) {
    return instance.post('/weight/create', {
      date: data.date.format('YYYY-MM-DD'),
      weight: Number(data.weight.toFixed(1))

    })
  },

  async updateRecord(params: { id: string; weight: number }) {
    return instance.post('/weight/update', {
      update_id: params.id,
      new_weight: params.weight.toFixed(1)
    })
  },

  async deleteRecord(id: string) {
    return new Promise((resolve, reject) => {
      Modal.confirm({
        title: '确认删除记录？',
        content: '删除后无法恢复',
        onOk: () => {
          instance.post('/weight/delete', { del_id: id })
            .then(resolve)
            .catch(reject)
        }
      })
    })
  }
}

// 文件下载（保持 POST）
export const downloadFile = async (url: string, filename: string) => {
  try {
    const res = await instance.post(url, {}, { responseType: 'blob' })
    const blob = new Blob([res.data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (error) {
    handleError(error instanceof Error ? error.message : '下载失败')
  }
}