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
      url: `/resource/download?id=${id}`,
      method: 'get',
      responseType: 'blob',
    })
  }

  static increaseDownloadCount (id) {
    return request({
      url: '/resource/increase-download',
      method: 'post',
      data: { id },
    })
  }
}

export default Upload
