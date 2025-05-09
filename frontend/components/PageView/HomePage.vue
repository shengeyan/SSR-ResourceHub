<template>
    <el-container class="homepage">
        <el-main class="main-content">
            <div
                class="section"
                v-for="section in sections"
                :key="section.title"
            >
                <div class="section-header">
                    <h2>{{ section.title }}</h2>
                    <el-button type="text" @click="goToMore(section.type)">
                        更多展示
                    </el-button>
                </div>
                <el-row :gutter="20">
                    <el-col
                        :span="6"
                        v-for="item in section.items.slice(0, 8)"
                        :key="item.id"
                        class="col-item"
                    >
                        <el-card class="resource-card" shadow="hover">
                            <div class="resource-title">{{ item.name }}</div>
                            <div class="resource-desc">{{ item.detail }}</div>

                            <!-- 根据 type 渲染不同内容 -->
                            <template v-if="section.type === 'images'">
                                <el-image
                                    :src="item.url"
                                    fit="contain"
                                    style="width: 100%; height: 120px"
                                />
                            </template>
                            <template v-if="section.type === 'audio'">
                                <audio controls style="width: 100%">
                                    <source :src="item.url" type="audio/mp3" />
                                    Your browser does not support the audio
                                    element.
                                </audio>
                            </template>
                            <template v-if="section.type === 'video'">
                                <video
                                    controls
                                    style="width: 100%; height: 120px"
                                >
                                    <source :src="item.url" type="video/mp4" />
                                    Your browser does not support the video
                                    element.
                                </video>
                            </template>
                            <template v-if="section.type === 'files'">
                            </template>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </el-main>

        <!-- Footer -->
        <el-footer class="footer">
            <div class="footer-content">
                ©2025 SSR-Resourcehub | 联系方式：itshengeyan@qq.com |
                备案号：沈歌宴
            </div>
        </el-footer>
    </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ResourceApi from '~/api/resources/resources.js'
import { useRouter } from 'vue-router'
const router = useRouter()

const sections = ref([
    {
        title: '文件资源',
        type: 'file',
        items: [],
    },
    {
        title: '音频资源',
        type: 'audio',
        items: [],
    },
    {
        title: '视频资源',
        type: 'video',
        items: [],
    },
    {
        title: '图片资源',
        type: 'images',
        items: [],
    },
])

const pathMap = {
    home: '/',
    file: '/file',
    audio: '/audio',
    video: '/video',
    images: '/images',
}

const goToMore = (type) => {
    router.push(pathMap[type] || '/')
}

onMounted(async () => {
    // 获取资源列表
    const fileData = await ResourceApi.getResourceList('file', 1)
    const videoData = await ResourceApi.getResourceList('video', 1)
    const imageData = await ResourceApi.getResourceList('image', 1)
    const audioData = await ResourceApi.getResourceList('audio', 1)

    sections.value = [
        {
            title: '文件资源',
            type: 'file',
            items: fileData.list,
        },
        {
            title: '音频资源',
            type: 'audio',
            items: audioData.list,
        },
        {
            title: '视频资源',
            type: 'video',
            items: videoData.list,
        },
        {
            title: '图片资源',
            type: 'images',
            items: imageData.list,
        },
    ]
})
</script>

<style scoped lang="scss">
.homepage {
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    display: block;
    background: url('/ink-brush-bg.jpg') no-repeat center center fixed;
    background-size: cover;
    font-family: 'Microsoft YaHei', serif;
    color: #2c3e50;
}

.main-content {
    padding: 40px;
    background-color: rgba(255, 255, 255, 0.85);
    border-radius: 8px;
    margin: 20px;
}

.section {
    margin-bottom: 40px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.resource-card {
    height: 140px;
    overflow: hidden;
    border-radius: 12px;
    transition: all 0.3s ease;
    background-color: #f9f9f9;
}

.resource-title {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 6px;
}

.resource-desc {
    font-size: 13px;
    color: #555;
}

.footer {
    background-color: rgba(255, 255, 255, 0.9);
    text-align: center;
    padding: 20px;
    border-top: 1px solid #eee;
    margin-bottom: 80px;
}

.footer-content {
    font-size: 14px;
    color: #666;
    word-break: break-word;
}

.col-item {
    margin-bottom: 20px;
}
</style>
