<template>
    <Teleport to="body">
        <div
            class="upload-float-wrapper"
            :style="{ top: position.top + 'px', left: position.left + 'px' }"
            @mousedown.stop.prevent="startDrag"
        >
            <el-button
                class="upload-button"
                circle
                type="primary"
                :disabled="dialogVisible"
                @click.stop="handleClick"
                >上传</el-button
            >
        </div>
    </Teleport>

    <UploadDialog ref="uploadDialogRef" @close="onDialogClose" />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import UploadDialog from '@/components/UploadDialog.vue'
import { useAuthStore } from '~/stores/auth'
import { ElMessageBox, ElMessage } from 'element-plus'

const authStore = useAuthStore()

const uploadDialogRef = ref()
const dialogVisible = ref(false)
const hasMoved = ref(false)
const position = reactive({ top: 50, left: 20 })
let offset = { x: 0, y: 0 }

const BUTTON_WIDTH = 60
const BUTTON_HEIGHT = 60

const startDrag = (e) => {
    hasMoved.value = false
    offset.x = e.clientX - position.left
    offset.y = e.clientY - position.top
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
    const newLeft = Math.max(
        0,
        Math.min(e.clientX - offset.x, window.innerWidth - BUTTON_WIDTH)
    )
    const newTop = Math.max(
        0,
        Math.min(e.clientY - offset.y, window.innerHeight - BUTTON_HEIGHT)
    )
    if (
        Math.abs(position.left - newLeft) > 2 ||
        Math.abs(position.top - newTop) > 2
    ) {
        hasMoved.value = true
    }
    position.left = newLeft
    position.top = newTop
}

const stopDrag = () => {
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)

    const threshold = 40
    if (position.left <= threshold) {
        position.left = 0
    } else if (position.left >= window.innerWidth - BUTTON_WIDTH - threshold) {
        position.left = window.innerWidth - BUTTON_WIDTH
    }
}

const handleClick = () => {
    if (!authStore.loginStatus) {
        ElMessageBox.confirm('您尚未登录，是否登录后继续上传？', '未登录', {
            confirmButtonText: '登录',
            cancelButtonText: '取消',
            type: 'warning',
        })
            .then(() => {
                router.push('/login')
            })
            .catch(() => {
                ElMessage.info('上传已取消')
            })
        return
    }

    if (!hasMoved.value && !dialogVisible.value) {
        dialogVisible.value = true
        uploadDialogRef.value?.open()
    }
}

const onDialogClose = () => {
    dialogVisible.value = false
}

onMounted(() => {
    position.left = window.innerWidth - BUTTON_WIDTH - 20
    position.top = window.innerHeight - BUTTON_HEIGHT - 20
})
</script>

<style scoped>
.upload-float-wrapper {
    position: fixed;
    z-index: 9999;
    cursor: grab;
    user-select: none;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: left 0.2s ease, top 0.2s ease;
}

.upload-button {
    width: 100%;
    height: 100%;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: auto;
}

@media (max-width: 768px) {
    .upload-float-wrapper {
        width: 50px;
        height: 50px;
    }
    .upload-button {
        font-size: 12px;
    }
}
</style>
