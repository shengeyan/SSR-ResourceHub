<template>
    <el-dialog
        v-model="visible"
        title="上传资源文件"
        width="60%"
        :before-close="handleClose"
        :append-to-body="true"
        :destroy-on-close="true"
        class="custom-upload-dialog"
    >
        <!-- 上传区域 -->
        <div class="upload-area-wrapper">
            <el-upload
                class="upload-area"
                drag
                :auto-upload="false"
                :file-list="fileList"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :limit="1"
            >
                <el-icon class="el-icon--upload"><Upload /></el-icon>
                <div class="el-upload__text">
                    拖拽文件到此或 <em>点击上传</em>
                </div>
            </el-upload>

            <!-- 上传文件提示 -->
            <div v-if="fileList.length > 0" class="uploaded-file-info">
                <!-- 显示用户设置的文件名前缀，后缀部分不可编辑 -->
                <el-input
                    v-model="fileNamePrefix"
                    class="file-name-prefix"
                    placeholder="输入文件名（不包含后缀）"
                    :disabled="false"
                />
                <div class="el-upload__tip">
                    支持图片、音频、视频、文档等类型，最大不超过 100MB
                </div>
            </div>
        </div>

        <!-- 资源类型选择框 -->
        <el-form-item label="文件类型" required>
            <el-select
                v-model="type"
                size="small"
                class="custom-select"
                placeholder="请选择资源类型"
            >
                <el-option label="图片" value="image" />
                <el-option label="音频" value="audio" />
                <el-option label="视频" value="video" />
                <el-option label="文件" value="file" />
            </el-select>
        </el-form-item>

        <!-- 资源描述输入框 -->
        <el-form-item label="资源描述" required>
            <el-input
                v-model="detail"
                type="textarea"
                placeholder="请输入资源的描述（可选）"
                :rows="4"
                class="custom-input"
            />
        </el-form-item>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose">取消</el-button>
                <el-button
                    type="primary"
                    @click="submitUpload"
                    class="upload-button"
                    >确认上传</el-button
                >
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import UploadApi from '~/api/upload/upload.js'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

const authStore = useAuthStore()

const visible = ref(false)
const fileList = ref([])
const type = ref('image')
const detail = ref('') 
const fileNamePrefix = ref('') 
const fileExtension = ref('') 

const open = () => {
    visible.value = true
    fileList.value = []
    type.value = 'image'
    detail.value = '' 
    fileNamePrefix.value = '' 
    fileExtension.value = '' 
}

const handleClose = () => {
    visible.value = false
}

const handleFileChange = (file, fileListNew) => {
    fileList.value = fileListNew
    if (file && file.raw) {
        setFileType(file.raw)
    }
}

const handleFileRemove = (file, fileListNew) => {
    fileList.value = fileListNew
}

const setFileType = (file) => {
    const fileName = file.name.toLowerCase()
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg']
    const audioExtensions = ['.mp3', '.wav', '.aac', '.flac']
    const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov']

    if (imageExtensions.some((ext) => fileName.endsWith(ext))) {
        fileExtension.value = '.jpg' 
        type.value = 'image'
    } else if (audioExtensions.some((ext) => fileName.endsWith(ext))) {
        fileExtension.value = '.mp3' 
        type.value = 'audio'
    } else if (videoExtensions.some((ext) => fileName.endsWith(ext))) {
        fileExtension.value = '.mp4' 
        type.value = 'video'
    } else {
        fileExtension.value = '.txt' 
        type.value = 'file'
    }

    // 自动设置文件名前缀为文件名的前缀
    fileNamePrefix.value = fileName.split('.')[0]
}

const submitUpload = async () => {
    // 验证文件名不能为空
    if (!fileNamePrefix.value) {
        ElMessage.warning('文件名不能为空')
        return
    }

    if (!fileList.value.length) {
        ElMessage.warning('请先选择文件')
        return
    }

    const file = fileList.value[0].raw
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type.value)
    formData.append('name', fileNamePrefix.value + fileExtension.value)
    formData.append('detail', detail.value)
    formData.append('uploader_id', authStore.user.id)

    try {
        const res = await UploadApi.uploadFile(formData)
        ElMessage.success('上传成功 ✅')
        handleClose()
        window.location.reload()
        console.log('上传失败:', router.currentRoute.value.fullPath)
    } catch (err) {
        ElMessage.error('上传失败: ' + (err.message || '未知错误'))
    }
}

defineExpose({ open })
</script>

<style scoped>
.custom-upload-dialog .el-dialog {
    overflow: hidden;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.upload-area-wrapper {
    border: 2px dashed #409eff;
    border-radius: 8px;
    padding: 20px;
    background-color: #f9f9f9;
    margin-bottom: 20px;
    text-align: center;
}

.upload-area {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.el-upload__text {
    font-size: 14px;
    color: #409eff;
}

.el-upload__tip {
    font-size: 12px;
    color: #666;
    margin-top: 10px;
    text-align: center;
}

.uploaded-file-info {
    margin-top: 10px;
    text-align: center;
}

.uploaded-file-name {
    font-size: 14px;
    color: #333;
    font-weight: bold;
    margin-bottom: 5px;
}

.file-name-prefix {
    width: 80%;
    margin-bottom: 10px;
}

.custom-select {
    width: 100%;
    margin-bottom: 20px;
}

.custom-input {
    width: 100%;
    margin-bottom: 20px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.upload-button {
    background-color: #409eff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
}

.upload-button:hover {
    background-color: #66b1ff;
}
</style>
