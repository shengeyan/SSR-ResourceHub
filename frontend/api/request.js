

import axios from 'axios'

const request = axios.create({
  // baseURL: '/api/v1',
  baseURL: 'http://127.0.0.1:3011/api/v1',
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 0) {
      return res.data || res
    } else {
      return Promise.reject(new Error(res.message || '业务逻辑失败'))
    }
  },
  error => {
    console.error('网络请求出错：', error)
    return Promise.reject(error)
  }
)

export default request
