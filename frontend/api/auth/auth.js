import request from '~/api/request.js'

class Auth {
  // 发送验证码
  static sendCode (data) {
    return request({
      url: '/auth/send-code',
      method: 'post',
      data
    })
  }

  // 注册
  static register (data) {
    return request({
      url: '/auth/register',
      method: 'post',
      data
    })
  }

  // 登录
  static login (data) {
    return request({
      url: '/auth/login',
      method: 'post',
      data
    })
  }

  // 重置密码
  static resetPassword (data) {
    return request({
      url: '/auth/reset-password',
      method: 'post',
      data
    })
  }

  // 更新用户信息
  static updateUser (data) {
    return request({
      url: '/auth/update-user',
      method: 'post',
      data,
    })
  }
}

export default Auth
