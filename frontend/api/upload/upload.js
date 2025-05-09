import request from '~/api/request.js'

class Upload {
  // 上传文件到 GitHub 仓库
  static uploadFile (data) {
    return request({
      url: '/upload/upload',
      method: 'post',
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  // 下载文件
  static downloadFile (id) {
    return request({
      url: `/resource/download?id=${id}`,  // 后端接口
      method: 'get',  // 使用 GET 请求
      responseType: 'blob',  // 确保返回文件（Blob 类型）
    })
  }
}

export default Upload
