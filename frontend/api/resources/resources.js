import request from '~/api/request.js'

class Resource {
  static getResourceList (type, page) {
    return request({
      url: '/resource/list',
      method: 'get',
      params: { type, page },
    })
  }

  static searchResources (query) {
    return request({
      url: '/resource/search',
      method: 'get',
      params: { query },
    })
  }

  static getResourcesByUploader (uploaderId) {
    return request({
      url: '/resource/by-uploader',
      method: 'get',
      params: { uploader_id: uploaderId },
    })
  }

  static deleteResource (id) {
    return request({
      url: '/resource/delete',
      method: 'post',
      data: { id },
    })
  }
}

export default Resource
