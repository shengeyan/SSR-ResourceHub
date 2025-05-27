<template>
    <el-container class="audio-resource-page">
        <el-main class="main-content">
            <el-row :gutter="20">
                <el-col
                    :xs="24"
                    :sm="12"
                    :md="8"
                    :lg="4"
                    v-for="item in audios"
                    :key="item.id"
                >
                    <el-card shadow="hover" class="audio-card">
                        <div class="audio-title">{{ item.title }}</div>
                        <div class="audio-player">
                            <audio
                                :src="item.url"
                                controls
                                style="width: 100%"
                            ></audio>
                        </div>
                        <div class="audio-meta">
                            <p class="audio-desc">{{ item.description }}</p>
                            <p class="audio-info">类型：{{ item.type }}</p>
                            <p class="audio-info">
                                大小：{{ (item.size / 1024 / 1024).toFixed(2) }}
                                MB
                            </p>
                            <p class="audio-info">格式：{{ item.mime_type }}</p>
                        </div>
                        <el-button type="text" @click="openDetail(item)"
                            >详情</el-button
                        >
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

        <el-dialog
            v-model="detailVisible"
            width="600px"
            :before-close="handleClose"
            class="blur-dialog"
            :close-on-click-modal="false"
            :lock-scroll="false"
        >
            <template #title>
                <div class="dialog-title">
                    <span>{{ selectedAudio?.name }}</span>
                    <el-button
                        type="text"
                        class="close-btn"
                        @click="detailVisible = false"
                    />
                </div>
            </template>
            <div class="dialog-content">
                <audio
                    :src="selectedAudio?.url"
                    controls
                    autoplay
                    style="width: 100%; margin: 12px 0"
                />
                <p>{{ selectedAudio?.description }}</p>
                <el-button type="primary" @click="handleDownload"
                    >下载音频</el-button
                >
            </div>
        </el-dialog>
    </el-container>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import ResourceApi from '~/api/resources/resources.js'
import { useAuthStore } from '~/stores/auth'
import { ElMessageBox, ElMessage } from 'element-plus'

const authStore = useAuthStore()
const audiosCache = ref({})
const audios = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 12

const detailVisible = ref(false)
const selectedAudio = ref(null)

// 获取音频
const fetchAudios = async (page) => {
    if (audiosCache.value[page]) {
        audios.value = audiosCache.value[page].data
        total.value = audiosCache.value[page].total
        return
    }
    const res = await ResourceApi.getResourceList('audio', page)
    audiosCache.value[page] = {
        data: res.list,
        total: res.total,
    }
    audios.value = res.list
    total.value = res.total
}

// 打开详情
const openDetail = (audio) => {
    selectedAudio.value = audio
    detailVisible.value = true
}

// 关闭详情
const handleClose = () => {
    detailVisible.value = false
}

// 切换页码
const handlePageChange = (page) => {
    currentPage.value = page
    fetchAudios(page)
}

// Init
watchEffect(() => {
    fetchAudios(currentPage.value)
})

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
        const fileUrl = selectedAudio.value.url
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = `${selectedAudio.value.name}.mp4`
        link.click()
        await Upload.increaseDownloadCount(selectedAudio.value.id)
    } catch (error) {
        console.error('下载失败', error)
    }
}
</script>

<style scoped>
.audio-resource-page {
    font-family: 'Microsoft YaHei', serif;
    background-size: cover;
    color: #2c3e50;
    min-height: 100vh;
    display: block;
    flex-direction: column;
}

.main-content {
    padding: 40px 20px;
    background-color: rgba(255, 255, 255, 0.85);
    border-radius: 8px;
    flex: 1;
    margin: 20px;
}

.audio-card {
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 220px;
    margin-bottom: 12px;
}

.audio-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
}

.audio-desc {
    font-size: 14px;
    color: #555;
    margin-top: 8px;
}

.audio-info {
    font-size: 12px;
    color: #888;
}

.audio-player {
    flex: 1;
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
}

.close-btn {
    float: right;
    font-size: 18px;
}
</style>
