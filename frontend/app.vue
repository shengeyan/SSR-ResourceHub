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

const route = useRoute()
const showRouter = ['/login', '/adimin']

const showNavBar = computed(() => {
    return !showRouter.includes(route.path)
})

const showUploadButton = computed(() => {
    return !showRouter.includes(route.path)
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
