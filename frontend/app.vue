<template>
    <div class="app-container">
        <NavBar v-if="showNavBar" />
        <NuxtPage />
        <UploadButton v-if="showUploadButton" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router' // 导入 useRoute
import UploadButton from '~/components/UploadButton.vue'
import NavBar from '@/components/NavBar.vue'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const showRouter = ['/login', '/adimin']
const authStore = useAuthStore()

const showNavBar = computed(() => {
    return !showRouter.includes(route.path)
})

const showUploadButton = computed(() => {
    return !showRouter.includes(route.path)
})

onMounted(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
        try {
            const user = JSON.parse(userStr)
            authStore.setToken(token)
            authStore.setUser(user)
            console.log(user)
        } catch (e) {
            console.warn('user 信息解析失败:', e)
        }
    }
})
</script>

<style scoped>
::-webkit-scrollbar {
    display: none;
}
.app-container {
    width: 100%;
    height: 100%;
    overflow: auto;
}
</style>
