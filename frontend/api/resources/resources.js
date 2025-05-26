import request from '~/api/request.js'

class Resource {
  // 获取资源列表
  static getResourceList (type, page) {
    return request({
      url: '/resource/list',
      method: 'get',
      params: { type, page },
    })
  }

  // 查询资源
  static searchResources (query) {
    return request({
      url: '/resource/search',
      method: 'get',
      params: { query },
    })
  }

  // 获取用户上传的资源
  static getResourcesByUploader (uploaderId) {
    return request({
      url: '/resource/by-uploader',
      method: 'get',
      params: { uploader_id: uploaderId },
    })
  }

  // 删除资源
  static deleteResource (id) {
    return request({
      url: '/resource/delete',
      method: 'post',
      data: { id },
    })
  }
}

export default Resource
