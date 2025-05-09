<template>
    <el-header class="header">
        <div class="nav-left">
            <span class="logo">资源平台</span>
            <el-menu
                mode="horizontal"
                class="nav-menu"
                @select="handleSelect"
                :default-active="activeMenu"
            >
                <el-menu-item index="home">首页</el-menu-item>
                <el-menu-item index="file">文件资源</el-menu-item>
                <el-menu-item index="audio">音频资源</el-menu-item>
                <el-menu-item index="video">视频资源</el-menu-item>
                <el-menu-item index="images">图片资源</el-menu-item>
            </el-menu>
        </div>
        <div class="nav-right">
            <!-- 搜索框 -->
            <el-input
                v-model="searchQuery"
                placeholder="搜索资源"
                @keyup.enter="handleSearch"
                clearable
                class="search-input"
                prefix-icon="el-icon-search"
            />
            <!-- 用户头像 -->
            <el-avatar
                :size="40"
                :src="userAvatar"
                style="cursor: pointer"
                @click="goToAccount"
            />
        </div>
    </el-header>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useSearchStore } from '~/stores/searchStore' // 引入 Pinia store

const authStore = useAuthStore()
const searchStore = useSearchStore()
const router = useRouter()

const userAvatar = ref(
    authStore.user?.avatar ||
        'https://api.dicebear.com/7.x/bottts/svg?seed=InkStyle'
)
const isLoggedIn = ref(authStore.loginStatus)
const searchQuery = ref(searchStore.query)

const goToAccount = () => {
    if (isLoggedIn.value) {
        router.push('/admin')
    } else {
        router.push('/login')
    }
}

const pathMap = {
    home: '/',
    file: '/file',
    audio: '/audio',
    video: '/video',
    images: '/images',
}

// 计算当前活跃的菜单项
const activeMenu = ref('home')
watch(
    () => router.currentRoute.value.path,
    (newPath) => {
        for (let key in pathMap) {
            if (pathMap[key] === newPath) {
                activeMenu.value = key
                break
            }
        }
    },
    { immediate: true }
)

// 跳转函数
const handleSelect = (index) => {
    router.push(pathMap[index] || '/')
}

// 搜索函数
const handleSearch = async () => {
    if (searchQuery.value) {
        router.push({ path: '/search', query: { q: searchQuery.value } })
    }
}

// 监听搜索词的变化
watch(
    () => searchStore.query,
    (newQuery) => {
        searchQuery.value = searchStore.query
    },
    { immediate: true }
)
</script>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 0 30px;
    border-bottom: 1px solid #eee;
}

.nav-left {
    display: flex;
    align-items: center;
}

.logo {
    font-size: 24px;
    font-weight: bold;
    color: #000;
    margin-right: 20px;
}

.nav-menu {
    display: flex;
    gap: 24px;
    background-color: transparent;
    border: none;
}

.nav-right {
    display: flex;
    align-items: center;
    gap: 20px;
}

/* 美化搜索框 */
.search-input {
    width: 240px;
    border-radius: 20px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;
    transition: box-shadow 0.3s ease;
}

.search-input .el-input__inner {
    height: 40px;
    padding-left: 30px; /* 为icon留出空间 */
    font-size: 14px;
    border-radius: 20px;
}

.search-input .el-input__inner:focus {
    border-color: #409eff;
    box-shadow: 0 0 5px rgba(64, 158, 255, 0.5);
}

.search-input .el-input__inner::placeholder {
    color: #aaa;
}

/* 搜索框图标 */
.search-input .el-input__prefix {
    font-size: 18px;
    color: #aaa;
}
</style>
