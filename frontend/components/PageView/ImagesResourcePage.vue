<template>
    <el-container class="image-resource-page">
        <el-main class="main-content">
            <el-row :gutter="20">
                <el-col
                    :xs="12"
                    :sm="8"
                    :md="6"
                    :lg="4"
                    v-for="item in images"
                    :key="item.id"
                >
                    <el-card
                        shadow="hover"
                        class="image-card"
                        @click="openDetail(item)"
                    >
                        <el-image
                            :src="item.url"
                            :preview-src-list="[]"
                            fit="cover"
                            style="
                                width: 100%;
                                height: 150px;
                                border-radius: 8px;
                            "
                        />
                        <div class="image-title">{{ item.name }}</div>
                    </el-card>
                </el-col>
            </el-row>
            <div class="pagination-wrapper">
                <el-pagination
                    layout="prev, pager, next"
                    :total="total"
                    :page-size="pageSize"
                    @current-change="handlePageChange"
                />
            </div>
        </el-main>

        <!-- 图片详情弹窗 -->
        <el-dialog
            v-model="detailVisible"
            width="60%"
            :before-close="handleClose"
            :close-on-click-modal="false"
            :lock-scroll="false"
            :max-width="'800px'"
        >
            <template #title>
                <div class="dialog-title">
                    <span>{{ selectedImage?.name }}</span>
                    <el-button
                        type="text"
                        class="close-btn"
                        @click="detailVisible = false"
                    />
                </div>
            </template>

            <div class="dialog-content">
                <el-image
                    :src="selectedImage?.url"
                    fit="contain"
                    style="
                        max-width: 40%;
                        max-height: 80vh;
                        border-radius: 12px;
                    "
                />
                <p class="image-desc">{{ selectedImage?.detail }}</p>
                <el-button type="primary" @click="handleDownload">
                    下载图片
                </el-button>

                <el-button
                    v-if="canDeleteImage"
                    type="danger"
                    @click="handleDelete"
                    style="margin-left: 10px"
                >
                    删除图片
                </el-button>
            </div>
        </el-dialog>
    </el-container>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '~/stores/auth'
import ResourceApi from '~/api/resources/resources.js'
import Upload from '~/api/upload/upload.js'

const authStore = useAuthStore()
const imagesCache = ref({})
const images = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 12

const detailVisible = ref(false)
const selectedImage = ref(null)

// 获取图片列表
const fetchImages = async (page) => {
    if (imagesCache.value[page]) {
        images.value = imagesCache.value[page].data
        total.value = imagesCache.value[page].total
        return
    }
    const res = await ResourceApi.getResourceList('image', page)
    imagesCache.value[page] = {
        data: res.list,
        total: res.total,
    }
    images.value = res.list
    total.value = res.total
}

watchEffect(() => {
    fetchImages(currentPage.value)
})

const openDetail = (image) => {
    selectedImage.value = image
    detailVisible.value = true
}

const handleClose = () => {
    detailVisible.value = false
}

const handlePageChange = (page) => {
    currentPage.value = page
    fetchImages(page)
}

// 下载图片
const handleDownload = () => {
    // 判断是否登录
    if (!authStore.loginStatus) {
        ElMessageBox.confirm('您尚未登录，是否登录后继续下载？', '未登录', {
            confirmButtonText: '登录',
            cancelButtonText: '取消',
            type: 'warning',
        })
            .then(() => {
                router.push('/login')
            })
            .catch(() => {
                ElMessage.info('下载已取消')
            })
        return
    }

    try {
        const fileUrl = selectedImage.value.url
        const fileName = selectedImage.value.name

        const link = document.createElement('a')
        link.href = fileUrl

        link.download = fileName

        const xhr = new XMLHttpRequest()
        xhr.open('GET', fileUrl, true)
        xhr.responseType = 'blob'
        xhr.onload = async function () {
            const blob = xhr.response
            const url = window.URL.createObjectURL(blob)

            link.href = url
            link.download = fileName
            link.click()
            window.URL.revokeObjectURL(url)
            await Upload.increaseDownloadCount(selectedImage.value.id)
        }
        xhr.send()
    } catch (error) {
        console.error('下载失败', error)
    }
}

// 判断用户是否有删除权限
const canDeleteImage = computed(() => {
    return (
        authStore.loginStatus &&
        selectedImage.value &&
        selectedImage.value.uploader_id === authStore.user?.id
    )
})

// 删除图片
const handleDelete = async () => {
    if (!selectedImage.value || !selectedImage.value.id) {
        ElMessage.error('无法删除：没有找到该图片的信息')
        return
    }

    try {
        await ElMessageBox.confirm(
            `确定删除图片 "${selectedImage.value.name}" 吗？`,
            '警告',
            {
                type: 'warning',
            }
        )
        const res = await ResourceApi.deleteResource(selectedImage.value.id)
        if (res) {
            ElMessage.success('图片删除成功')
            detailVisible.value = false
            fetchImages(currentPage.value)
        } else {
            ElMessage.error(res.message || '删除失败')
        }
    } catch (error) {
        console.error('删除失败', error)
    }
}
</script>

<style scoped>
.image-resource-page {
    font-family: 'Microsoft YaHei', serif;
    background-size: cover;
    color: #2c3e50;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.main-content {
    padding: 40px 20px;
    background-color: rgba(255, 255, 255, 0.85);
    border-radius: 8px;
    flex: 1;
    margin: 20px;
}

.image-card {
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    text-align: center;
    margin-bottom: 12px;
}

.image-title {
    font-size: 14px;
    margin-top: 10px;
    font-weight: bold;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.image-desc {
    margin-top: 12px;
    margin-bottom: 12px;
    font-size: 14px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

.blur-dialog ::v-deep(.el-overlay) {
    backdrop-filter: blur(6px);
    background-color: rgba(255, 255, 255, 0.2);
}

.dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
}

.dialog-content {
    font-size: 15px;
    color: #333;
    text-align: center;
}

.close-btn {
    float: right;
    font-size: 18px;
}

.el-dialog__footer {
    display: flex;
    justify-content: flex-end;
}

.el-button {
    margin-left: 10px;
}

.action-button {
    margin-top: 10px;
    width: 120px;
    margin-bottom: 10px;
}

.custom-dialog .el-dialog {
    border-radius: 16px;
    padding: 20px;
}
</style>
