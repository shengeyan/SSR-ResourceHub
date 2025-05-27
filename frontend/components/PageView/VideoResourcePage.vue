<template>
    <el-container class="video-resource-page">
        <el-main class="main-content">
            <el-row :gutter="20">
                <el-col
                    :xs="24"
                    :sm="12"
                    :md="8"
                    :lg="4"
                    v-for="item in videos"
                    :key="item.id"
                >
                    <el-card shadow="hover" class="video-card">
                        <div class="video-title">{{ item.title }}</div>
                        <video
                            controls
                            muted
                            playsinline
                            style="
                                width: 100%;
                                height: 100px;
                                object-fit: cover;
                                border-radius: 8px;
                            "
                        >
                            <source :src="item.url" type="video/mp4" />
                        </video>
                        <div class="video-meta">
                            <p class="video-desc">{{ item.description }}</p>
                            <p class="video-info">类型：{{ item.type }}</p>
                            <p class="video-info">
                                大小：{{ (item.size / 1024 / 1024).toFixed(2) }}
                                MB
                            </p>
                            <p class="video-info">格式：{{ item.mime_type }}</p>
                        </div>
                        <el-button
                            type="text"
                            @click="openDetail(item)"
                            style="margin-top: 6px"
                        >
                            详情
                        </el-button>
                    </el-card>
                </el-col>
            </el-row>

            <div class="pagination-wrapper">
                <el-pagination
                    layout="prev, pager, next"
                    :total="total"
                    :page-size="pageSize"
                    :hide-on-single-page="false"
                    @current-change="handlePageChange"
                />
            </div>
        </el-main>

        <!-- 视频详情弹窗 -->
        <el-dialog
            v-model="detailVisible"
            width="50%"
            :before-close="handleClose"
            :close-on-click-modal="false"
            :lock-scroll="false"
            :max-width="'800px'"
            class="custom-dialog"
        >
            <template #title>
                <div class="dialog-title">
                    <span>{{ selectedVideo?.name }}</span>
                    <el-button
                        type="text"
                        class="close-btn"
                        @click="detailVisible = false"
                    />
                </div>
            </template>

            <div class="dialog-content">
                <video
                    :src="selectedVideo?.url"
                    controls
                    autoplay
                    style="
                        width: 100%;
                        height: 300px;
                        object-fit: contain;
                        margin: 12px 0;
                        border-radius: 12px;
                    "
                />
                <p class="video-desc">{{ selectedVideo?.description }}</p>
                <el-button
                    type="primary"
                    @click="handleDownload"
                    class="action-button"
                >
                    下载视频
                </el-button>

                <el-button
                    v-if="canDeleteVideo"
                    type="danger"
                    @click="handleDelete"
                    class="action-button"
                    style="margin-left: 10px"
                >
                    删除视频
                </el-button>
            </div>
        </el-dialog>
    </el-container>
</template>

<script setup>
import { ref, reactive, computed, watchEffect } from 'vue'
import { useAuthStore } from '~/stores/auth'
import ResourceApi from '~/api/resources/resources.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import Upload from '~/api/upload/upload.js'

const authStore = useAuthStore()

const videosCache = reactive({})
const videos = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 12
const detailVisible = ref(false)
const selectedVideo = ref(null)

// 获取视频列表
const fetchVideos = async (page) => {
    if (videosCache[page]) {
        videos.value = videosCache[page].data
        total.value = videosCache[page].total
        return
    }
    const res = await ResourceApi.getResourceList('video', page)
    videosCache[page] = {
        data: res.list,
        total: res.total,
    }
    videos.value = res.list
    total.value = res.total
}

const openDetail = (video) => {
    selectedVideo.value = video
    detailVisible.value = true
}

const handleClose = () => {
    detailVisible.value = false
}

// 切页函数
const handlePageChange = (page) => {
    currentPage.value = page
    fetchVideos(page)
}

// 下载视频
const handleDownload = async () => {
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
        const fileUrl = selectedVideo.value.url
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = `${selectedVideo.value.name}.mp4`
        link.click()
        await Upload.increaseDownloadCount(selectedVideo.value.id)
    } catch (error) {
        console.error('下载失败', error)
    }
}

// 登录状态且ID相同
const canDeleteVideo = computed(() => {
    return (
        authStore.loginStatus &&
        selectedVideo.value &&
        selectedVideo.value.uploader_id === authStore.user?.id
    )
})

// 删除函数
const handleDelete = async () => {
    if (!selectedVideo.value || !selectedVideo.value.id) {
        ElMessage.error('无法删除：没有找到该视频的信息')
        return
    }

    try {
        await ElMessageBox.confirm(
            `确定删除视频 "${selectedVideo.value.title}" 吗？`,
            '警告',
            {
                type: 'warning',
            }
        )
        const res = await ResourceApi.deleteResource(selectedVideo.value.id)
        if (res) {
            ElMessage.success('视频删除成功')
            detailVisible.value = false
            fetchVideos(currentPage.value)
        } else {
            ElMessage.error(res.message || '删除失败')
        }
    } catch (error) {
        console.error('删除失败', error)
    }
}

watchEffect(() => {
    fetchVideos(currentPage.value)
})
</script>

<style scoped>
.video-resource-page {
    font-family: 'Microsoft YaHei', serif;
    background-size: cover;
    color: #2c3e50;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.main-content {
    background-color: rgba(255, 255, 255, 0.85);
    border-radius: 8px;
}

.video-card {
    border-radius: 8px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.video-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

video {
    width: 100%;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
}

.video-desc {
    font-size: 12px;
    color: #666;
    margin-bottom: 2px;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.video-info {
    font-size: 12px;
    color: #888;
    margin: 1px 0;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 20px 0;
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
