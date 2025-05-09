<template>
    <div class="search-page">
        <h2>搜索结果</h2>

        <!-- 显示搜索框 -->
        <el-input
            v-model="searchQuery"
            placeholder="搜索资源"
            class="search-input"
            prefix-icon="el-icon-search"
            @keyup.enter="handleSearch"
            clearable
        />

        <!-- 搜索结果 -->
        <el-card v-if="searchResults.length === 0" class="no-results-card">
            <p>没有找到匹配的资源。</p>
        </el-card>

        <!-- 列表展示搜索结果 -->
        <el-list v-if="searchResults.length > 0">
            <el-list-item
                v-for="item in searchResults"
                :key="item.id"
                class="list-item"
                @click="handleItemClick(item)"
            >
                <div class="list-item-content">
                    <h3 class="item-title">{{ item.name }}</h3>
                    <p class="item-detail">{{ item.detail }}</p>
                </div>
            </el-list-item>
        </el-list>

        <!-- 弹窗显示详情 -->
        <el-dialog
            v-model="dialogVisible"
            width="60%"
            @close="handleClose"
            :before-close="handleClose"
            class="custom-dialog"
        >
            <template #title>
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
                <!-- 根据资源类型进行不同的渲染 -->
                <template v-if="selectedItem?.type === 'image'">
                    <el-image
                        :src="selectedItem?.url"
                        fit="contain"
                        style="
                            max-width: 100%;
                            max-height: 60vh;
                            border-radius: 12px;
                        "
                    />
                </template>
                <template v-else-if="selectedItem?.type === 'video'">
                    <video
                        controls
                        autoplay
                        style="width: 100%; border-radius: 8px; margin: 12px 0"
                    >
                        <source :src="selectedItem?.url" type="video/mp4" />
                    </video>
                </template>
                <template v-else-if="selectedItem?.type === 'audio'">
                    <audio controls style="width: 100%; margin: 12px 0">
                        <source :src="selectedItem?.url" type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                </template>
                <template v-else-if="selectedItem?.type === 'file'">
                    <p>{{ selectedItem?.name }}</p>
                </template>

                <el-button
                    type="primary"
                    icon="el-icon-download"
                    @click="handleDownloadType"
                    class="action-button"
                >
                    下载
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

const searchStore = useSearchStore()

const searchQuery = ref(searchStore.query) // 从 store 中获取搜索查询
const searchResults = ref([]) // 存储搜索结果
const selectedItem = ref(null) // 存储当前被选中的项
const dialogVisible = ref(false) // 控制弹窗的显示与隐藏
const route = useRoute() // 获取路由对象
const router = useRouter()

// 处理搜索逻辑
const handleSearch = async () => {
    if (searchQuery.value) {
        router.push({ path: '/search', query: { q: searchQuery.value } })
    }
}

// 执行搜索请求
const searchResources = async (query) => {
    try {
        const response = await Resource.searchResources(query)
        searchResults.value = response.list
        searchStore.setQuery(query)
    } catch (error) {
        console.error('搜索失败', error)
    }
}

// 处理点击每个项时的逻辑
const handleItemClick = (item) => {
    selectedItem.value = item
    dialogVisible.value = true
}

// 关闭弹窗的处理函数
const handleClose = () => {
    dialogVisible.value = false
}

const handleDownloadType = () => {
    if (selectedItem.value.type === 'image') {
        handleDownloadImage()
    } else {
        handleDownload()
    }
}

const handleDownload = () => {
    try {
        const fileUrl = selectedItem.value.url
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = `${selectedItem.value.name}`
        link.click()
    } catch (error) {
        console.error('下载失败', error)
    }
}

const handleDownloadImage = () => {
    try {
        const fileUrl = selectedItem.value.url
        const fileName = selectedItem.value.name

        const link = document.createElement('a')
        link.href = fileUrl

        link.download = fileName

        const xhr = new XMLHttpRequest()
        xhr.open('GET', fileUrl, true)
        xhr.responseType = 'blob'
        xhr.onload = function () {
            const blob = xhr.response
            const url = window.URL.createObjectURL(blob)

            link.href = url
            link.download = fileName
            link.click()
            window.URL.revokeObjectURL(url)
        }
        xhr.send()
    } catch (error) {
        console.error('下载失败', error)
    }
}

onMounted(async () => {
    const query = route.query.q
    if (query) {
        searchQuery.value = query
        await searchResources(query)
    }
})

// 监听搜索词的变化
watch(
    () => route.query.q,
    async (newQuery) => {
        if (newQuery) {
            searchQuery.value = newQuery
            searchStore.setQuery(newQuery)
            await searchResources(newQuery)
        }
    },
    { immediate: true }
)
</script>

<style scoped lang="scss">
.search-page {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    height: 100vh; /* 页面至少占满一个视口 */
    overflow-y: auto; /* 内容超出时垂直滚动 */
}

.search-input {
    width: 100%;
    margin-bottom: 20px;
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

    &:last-child {
        margin-bottom: 100px;
    }
}

.list-item .item-title {
    font-size: 18px;
    font-weight: bold;
}

.list-item .item-detail {
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
</style>
