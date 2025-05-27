<template>
    <div class="search-page">
        <!-- 顶部固定区域 -->
        <div class="fixed-header">
            <h2>搜索结果</h2>

            <el-input
                v-model="searchQuery"
                placeholder="搜索资源"
                class="search-input"
                prefix-icon="el-icon-search"
                @keyup.enter="handleSearch"
                clearable
            />

            <div class="filter-bar">
                <el-select
                    v-model="filterType"
                    placeholder="资源类型"
                    clearable
                    style="width: 140px"
                >
                    <el-option label="图片" value="image" />
                    <el-option label="音频" value="audio" />
                    <el-option label="视频" value="video" />
                    <el-option label="文件" value="file" />
                </el-select>

                <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 250px"
                />

                <el-select
                    v-model="sortOrder"
                    placeholder="上传时间排序"
                    style="width: 160px"
                >
                    <el-option label="最新优先" value="desc" />
                    <el-option label="最早优先" value="asc" />
                </el-select>

                <el-button type="primary" @click="applyFilter"
                    >应用筛选</el-button
                >
            </div>
        </div>

        <!-- 滚动内容区域 -->
        <div class="scroll-area">
            <el-card v-if="searchResults.length === 0" class="no-results-card">
                <p>没有找到匹配的资源。</p>
            </el-card>

            <el-list v-else>
                <el-list-item
                    v-for="item in searchResults"
                    :key="item.id"
                    class="list-item"
                    @click="handleItemClick(item)"
                >
                    <div class="list-item-content">
                        <h3 class="item-title">{{ item.name }}</h3>
                        <p class="item-detail">
                            {{ item.detail || '暂无描述' }}
                        </p>
                    </div>
                </el-list-item>
            </el-list>
        </div>

        <!-- 弹窗详情 -->
        <el-dialog
            v-model="dialogVisible"
            width="60%"
            @close="handleClose"
            :before-close="handleClose"
            class="custom-dialog"
        >
            <template #header>
                <div class="dialog-title">
                    <span>{{ selectedItem?.name }}</span>
                    <el-button
                        type="text"
                        icon="el-icon-close"
                        class="close-btn"
                        @click="dialogVisible = false"
                    />
                </div>
            </template>

            <div class="dialog-content">
                <!-- 资源预览 -->
                <template v-if="selectedItem?.type === 'image'">
                    <img
                        :src="selectedItem.url"
                        alt="preview"
                        style="
                            max-width: 100%;
                            max-height: 35vh;
                            border-radius: 12px;
                            margin-bottom: 16px;
                            display: block;
                            margin-left: auto;
                            margin-right: auto;
                        "
                    />
                </template>
                <template v-else-if="selectedItem?.type === 'video'">
                    <video
                        controls
                        autoplay
                        style="
                            width: 100%;
                            border-radius: 8px;
                            margin-bottom: 16px;
                        "
                    >
                        <source :src="selectedItem.url" type="video/mp4" />
                    </video>
                </template>
                <template v-else-if="selectedItem?.type === 'audio'">
                    <audio controls style="width: 100%; margin-bottom: 16px">
                        <source :src="selectedItem.url" type="audio/mpeg" />
                    </audio>
                </template>
                <template v-else-if="selectedItem?.type === 'file'">
                    <el-icon><Document /></el-icon>
                    <p style="margin: 10px 0">{{ selectedItem.name }}</p>
                </template>

                <!-- 信息展示 -->
                <div class="info-grid">
                    <div><strong>类型：</strong>{{ selectedItem.type }}</div>
                    <div>
                        <strong>文件大小：</strong
                        >{{ formatSize(selectedItem.size) }}
                    </div>
                    <div>
                        <strong>上传时间：</strong
                        >{{ formatDate(selectedItem.created_at) }}
                    </div>
                    <div>
                        <strong>下载次数：</strong
                        >{{ selectedItem.download_count }}
                    </div>
                </div>

                <!-- 描述 -->
                <p style="margin-top: 10px; color: #555">
                    {{ selectedItem.detail || '暂无描述' }}
                </p>

                <!-- 下载按钮 -->
                <el-button
                    type="primary"
                    icon="el-icon-download"
                    @click="handleDownloadType"
                    class="action-button"
                >
                    下载资源
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Resource from '~/api/resources/resources'
import { useSearchStore } from '~/stores/searchStore'
import Upload from '~/api/upload/upload.js'

const searchStore = useSearchStore()
const searchQuery = ref(searchStore.query)
const fullResults = ref([])
const searchResults = ref([])
const selectedItem = ref(null)
const dialogVisible = ref(false)
const route = useRoute()
const router = useRouter()

const filterType = ref(null)
const dateRange = ref([])
const sortOrder = ref('desc')

// 搜索提交
const handleSearch = () => {
    if (searchQuery.value) {
        router.push({ path: '/search', query: { q: searchQuery.value } })
    }
}

// 执行搜索请求
const searchResources = async (query) => {
    try {
        const response = await Resource.searchResources(query)
        fullResults.value = response.list || []
        applyFilter()
        searchStore.setQuery(query)
    } catch (error) {
        console.error('搜索失败', error)
    }
}

// 应用本地筛选 + 排序
const applyFilter = () => {
    const type = filterType.value
    const [start, end] = dateRange.value

    let filtered = fullResults.value.filter((item) => {
        const matchType = type ? item.type === type : true
        const matchDate =
            start && end
                ? new Date(item.created_at) >= new Date(start) &&
                  new Date(item.created_at) <= new Date(end)
                : true
        return matchType && matchDate
    })

    filtered.sort((a, b) => {
        const timeA = new Date(a.created_at).getTime()
        const timeB = new Date(b.created_at).getTime()
        return sortOrder.value === 'asc' ? timeA - timeB : timeB - timeA
    })

    searchResults.value = filtered
}

// 打开详情弹窗
const handleItemClick = (item) => {
    selectedItem.value = item
    dialogVisible.value = true
}

// 弹窗关闭
const handleClose = () => {
    dialogVisible.value = false
}

// 下载处理
const handleDownloadType = async () => {
    if (selectedItem.value.type === 'image') {
        handleDownloadImage()
    } else {
        handleDownload()
    }
    await Upload.increaseDownloadCount(selectedItem.value.id)
}

const handleDownload = () => {
    try {
        const link = document.createElement('a')
        link.href = selectedItem.value.url
        link.download = selectedItem.value.name
        link.click()
    } catch (error) {
        console.error('下载失败', error)
    }
}

const handleDownloadImage = () => {
    try {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', selectedItem.value.url, true)
        xhr.responseType = 'blob'
        xhr.onload = function () {
            const blob = xhr.response
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = selectedItem.value.name
            link.click()
            window.URL.revokeObjectURL(url)
        }
        xhr.send()
    } catch (error) {
        console.error('图片下载失败', error)
    }
}

const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024)
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString()
}

// 初始化：从路由中获取关键词
onMounted(async () => {
    const q = route.query.q
    if (q) {
        searchQuery.value = q
        await searchResources(q)
    }
})

// 监听关键词变化
watch(
    () => route.query.q,
    async (newQ) => {
        if (newQ) {
            searchQuery.value = newQ
            searchStore.setQuery(newQ)
            await searchResources(newQ)
        }
    },
    { immediate: true }
)
</script>

<style scoped lang="scss">
.search-page {
    position: relative;
    height: 100vh;
    overflow: hidden;
    max-width: 800px;
    margin: 0 auto;
    background: #fff;
}

.fixed-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #fff;
    padding: 20px 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-input {
    width: 100%;
    margin-bottom: 12px;
}

.filter-bar {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.scroll-area {
    height: calc(100vh - 180px);
    overflow-y: auto;
    padding: 10px 0;
    scrollbar-width: none;
}

/* 隐藏 WebKit 滚动条 */
.scroll-area::-webkit-scrollbar {
    display: none;
}

.no-results-card {
    text-align: center;
    margin-top: 20px;
}

.list-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
}
.list-item:last-child {
    margin-bottom: 100px;
}
.item-title {
    font-size: 18px;
    font-weight: bold;
}

.item-detail {
    color: #666;
}

.dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dialog-content {
    font-size: 15px;
    color: #333;
    text-align: center;
}

.close-btn {
    font-size: 18px;
    cursor: pointer;
}

.custom-dialog .el-dialog__footer {
    display: flex;
    justify-content: space-between;
    padding-top: 20px;
    gap: 10px;
}

.action-button {
    margin-top: 10px;
    width: 100%;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 20px;
    margin-bottom: 12px;
    font-size: 14px;
    color: #333;
}
</style>
