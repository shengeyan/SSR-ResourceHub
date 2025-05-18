<template>
    <el-container class="admin-page">
        <el-main class="main-content">
            <el-card class="welcome-card">
                <div class="welcome-header">
                    <el-avatar :size="60" :src="userData.avatar" />
                    <div class="welcome-info">
                        <h2>欢迎回来，{{ userData.username }}</h2>
                        <p>今天是 {{ currentDate }}</p>
                    </div>
                </div>
            </el-card>

            <!-- 原有 admin-widgets 不删除 -->
            <el-row :gutter="20" class="admin-widgets">
                <el-col :xs="24" :sm="12" :md="8">
                    <el-card shadow="hover">
                        <div class="stat-title">资源总数</div>
                        <div class="stat-value">{{ resourcesData.total }}</div>
                    </el-card>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8">
                    <el-card shadow="hover">
                        <div class="stat-title">下载总数</div>
                        <div class="stat-value">
                            {{ resourcesData.downloadTotal }}
                        </div>
                    </el-card>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8">
                    <el-card shadow="hover">
                        <div class="stat-title">今日上传</div>
                        <div class="stat-value">
                            {{ resourcesData.todayUploadCount }}
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 新增资源表格 -->
            <el-card class="resource-card">
                <div class="card-header">
                    <span>我的资源</span>
                    <el-button
                        type="primary"
                        @click="openEditDialog"
                        size="small"
                        >编辑个人信息</el-button
                    >
                </div>
                <el-table :data="userResources" stripe style="width: 100%">
                    <el-table-column prop="name" label="资源名称" />
                    <el-table-column prop="type" label="类型" width="100" />
                    <el-table-column
                        prop="size"
                        label="大小 (KB)"
                        width="100"
                    />
                    <el-table-column
                        prop="download_count"
                        label="下载数"
                        width="100"
                    />
                    <el-table-column
                        prop="created_at"
                        label="上传时间"
                        width="180"
                    />
                    <el-table-column label="操作" width="180">
                        <template #default="{ row }">
                            <el-button size="small" @click="handleDownload(row)"
                                >下载</el-button
                            >
                            <el-button
                                size="small"
                                type="danger"
                                @click="deleteResource(row)"
                                >删除</el-button
                            >
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>

            <!-- 编辑用户信息弹窗 -->
            <el-dialog
                v-model="editDialogVisible"
                title="编辑用户信息"
                width="400px"
            >
                <el-form :model="editForm" label-width="80px">
                    <el-form-item label="用户名">
                        <el-input v-model="editForm.username" />
                    </el-form-item>
                    <el-form-item label="头像链接">
                        <el-input v-model="editForm.avatar" />
                    </el-form-item>
                </el-form>
                <template #footer>
                    <el-button @click="editDialogVisible = false"
                        >取消</el-button
                    >
                    <el-button type="primary" @click="updateUserInfo"
                        >保存</el-button
                    >
                </template>
            </el-dialog>
        </el-main>
    </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '~/stores/auth'
import Resource from '~/api/resources/resources.js'
import Auth from '~/api/auth/auth.js'

const currentDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
})

const AuthStore = useAuthStore()
const userData = ref(AuthStore.user)

const resourcesData = ref({
    list: [],
    total: 0,
    downloadTotal: 0,
    todayUploadCount: 0,
})
const userResources = ref([])
// 编辑用户信息弹窗逻辑
const editDialogVisible = ref(false)
const editForm = ref({
    username: '',
    avatar: '',
})

// 获取用户资源
const fetchUserResources = async () => {
    try {
        const res = await Resource.getResourcesByUploader(userData.value.id)
        resourcesData.value = res
        userResources.value = res.list
    } catch (e) {
        ElMessage.error('资源加载失败')
    }
}

// 删除资源
const deleteResource = async (row) => {
    if (!row) return
    try {
        await ElMessageBox.confirm(`确定删除资源 "${row.name}" 吗？`, '警告', {
            type: 'warning',
        })
        const res = await Resource.deleteResource(row.id)
        if (res) {
            ElMessage.success(res.message || '删除成功')
            await fetchUserResources()
        }
    } catch (e) {
        console.error(e)
    }
}

// 下载资源
const handleDownload = (row) => {
    if (!row || !row.url) return
    const fileUrl = row.url
    const fileName = row.name || '下载文件'

    if (row?.type === 'image') {
        try {
            const xhr = new XMLHttpRequest()
            xhr.open('GET', fileUrl, true)
            xhr.responseType = 'blob'
            xhr.onload = function () {
                const blob = xhr.response
                const url = window.URL.createObjectURL(blob)

                const link = document.createElement('a')
                link.href = url
                link.download = fileName
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            }
            xhr.onerror = () => {
                ElMessage.error('图片下载失败')
            }
            xhr.send()
        } catch (error) {
            console.error('图片下载失败', error)
            ElMessage.error('图片下载失败')
        }
    } else {
        try {
            const link = document.createElement('a')
            link.href = fileUrl
            link.download = fileName
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('下载失败', error)
            ElMessage.error('下载失败')
        }
    }
}

// 打开编辑用户信息弹窗
const openEditDialog = () => {
    editForm.value.username = userData.value.username
    editForm.value.avatar = userData.value.avatar
    editDialogVisible.value = true
}

// 更新用户信息
const updateUserInfo = async () => {
    try {
        const res = await Auth.updateUser({
            username: editForm.value.username,
            avatar: editForm.value.avatar,
        })
        if (res) {
            ElMessage.success(res.message || '更新成功')
            AuthStore.setUser(res.userInfo)
            userData.value = res.userInfo
            editDialogVisible.value = false
        } else {
            ElMessage.error(res.message || '更新失败')
        }
    } catch (e) {
        ElMessage.error('更新失败')
    }
}

onMounted(() => {
    fetchUserResources()
})
</script>

<style scoped>
.admin-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 保证内部控制滚动 */
}

.main-content {
    flex: 1;
    overflow-y: auto;
    max-height: calc(100vh - 60px); /* 根据实际 header 高度调整 */
}

.welcome-card {
    margin-bottom: 30px;
    padding: 20px;
}

.welcome-header {
    display: flex;
    align-items: center;
    gap: 20px;
}

.welcome-info h2 {
    margin: 0;
}

.admin-widgets .el-card {
    text-align: center;
    padding: 24px;
}

.stat-title {
    font-size: 16px;
    color: #666;
    margin-bottom: 8px;
}

.stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #333;
}

.resource-card {
    margin-top: 30px;
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
</style>
