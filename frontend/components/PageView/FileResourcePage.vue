<template>
    <el-container class="file-resource-page">
        <el-main class="main-content">
            <el-row :gutter="20">
                <el-col
                    :xs="24"
                    :sm="12"
                    :md="8"
                    :lg="6"
                    v-for="item in files"
                    :key="item.id"
                >
                    <el-card
                        shadow="hover"
                        class="file-card"
                        @click="openDetail(item)"
                    >
                        <div class="file-title">{{ item.name }}</div>
                        <div class="file-desc">{{ item.detail }}</div>
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
                    <span>{{ selectedFile?.name }}</span>
                    <el-button
                        type="text"
                        class="close-btn"
                        @click="detailVisible = false"
                    />
                </div>
            </template>
            <div class="dialog-content">
                <p>{{ selectedFile?.detail }}</p>
                <el-button type="primary" @click="handleDownload"
                    >下载</el-button
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
import Upload from '~/api/upload/upload.js'

const authStore = useAuthStore()
const filesCache = ref({})
const files = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 12
const detailVisible = ref(false)
const selectedFile = ref(null)

// 请求数据
const fetchFiles = async (page) => {
    if (filesCache.value[page]) {
        files.value = filesCache.value[page].data
        total.value = filesCache.value[page].total
        return
    }
    const res = await ResourceApi.getResourceList('file', page)
    filesCache.value[page] = {
        data: res.list,
        total: res.total,
    }
    files.value = res.list
    total.value = res.total
}

watchEffect(() => {
    fetchFiles(currentPage.value)
})

const openDetail = (file) => {
    selectedFile.value = file
    detailVisible.value = true
}

const handleClose = () => {
    detailVisible.value = false
}

const handlePageChange = (page) => {
    currentPage.value = page
    fetchFiles(page)
}

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
        const fileUrl = selectedFile.value.url
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = `${selectedFile.value.name}.mp4`
        link.click()
        await Upload.increaseDownloadCount(selectedFile.value.id)
    } catch (error) {
        console.error('下载失败', error)
    }
}
</script>

<style scoped>
.file-resource-page {
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.main-content {
    background-color: rgba(255, 255, 255, 0.85);
    border-radius: 8px;
    flex: 1;
}

.file-card {
    cursor: pointer;
    border-radius: 12px;
    height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10px;
    margin-bottom: 12px;
}

.file-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
}

.file-desc {
    font-size: 14px;
    color: #555;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.close-btn {
    float: right;
    font-size: 18px;
}
</style>
