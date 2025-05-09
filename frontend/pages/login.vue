<template>
    <div class="auth-page">
        <el-card class="auth-card">
            <div class="auth-header">
                <h2>{{ isLogin ? '登录账户' : '注册账户' }}</h2>
                <el-button type="text" @click="toggleMode">
                    {{ isLogin ? '没有账户？点击注册' : '已有账户？点击登录' }}
                </el-button>
            </div>

            <el-form
                :model="form"
                :rules="rules"
                ref="formRef"
                label-width="80px"
                class="auth-form"
            >
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" placeholder="请输入邮箱" />
                </el-form-item>

                <el-form-item label="验证码" prop="code">
                    <div style="display: flex; gap: 8px">
                        <el-input
                            v-model="form.code"
                            placeholder="请输入验证码"
                        />
                        <el-button
                            :disabled="countdown > 0"
                            @click="handleSendCode"
                        >
                            {{
                                countdown > 0
                                    ? `${countdown}s后重发`
                                    : '发送验证码'
                            }}
                        </el-button>
                    </div>
                </el-form-item>

                <el-form-item label="密码" prop="password">
                    <el-input
                        v-model="form.password"
                        type="password"
                        placeholder="请输入密码"
                    />
                </el-form-item>

                <el-form-item v-if="!isLogin" label="确认密码" prop="confirm">
                    <el-input
                        v-model="form.confirm"
                        type="password"
                        placeholder="请再次输入密码"
                    />
                </el-form-item>

                <el-form-item class="submit-btn">
                    <el-button type="primary" @click="handleSubmit">
                        {{ isLogin ? '登录' : '注册' }}
                    </el-button>
                </el-form-item>

                <el-form-item v-if="isLogin" class="submit-btn">
                    <el-button type="text" @click="showResetDialog = true"
                        >忘记密码？</el-button
                    >
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 忘记密码弹窗 -->
        <el-dialog v-model="showResetDialog" title="重置密码" width="400px">
            <el-form
                :model="resetPasswordForm"
                :rules="resetPasswordRules"
                ref="resetFormRef"
                label-width="80px"
            >
                <el-form-item label="邮箱" prop="email">
                    <el-input
                        v-model="resetPasswordForm.email"
                        placeholder="请输入邮箱"
                    />
                </el-form-item>
                <el-form-item label="验证码" prop="code">
                    <div style="display: flex; gap: 8px">
                        <el-input
                            v-model="resetPasswordForm.code"
                            placeholder="请输入验证码"
                        />
                        <el-button
                            :disabled="resetCountdown > 0"
                            @click="handleResetSendCode"
                        >
                            {{
                                resetCountdown > 0
                                    ? `${resetCountdown}s后重发`
                                    : '发送验证码'
                            }}
                        </el-button>
                    </div>
                </el-form-item>
                <el-form-item label="新密码" prop="password">
                    <el-input
                        v-model="resetPasswordForm.password"
                        type="password"
                        placeholder="请输入新密码"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showResetDialog = false">取消</el-button>
                <el-button type="primary" @click="handleResetPassword"
                    >重置密码</el-button
                >
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import Auth from '~/api/auth/auth.js'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const AuthStore = useAuthStore()
const router = useRouter()

const formRef = ref()
const isLogin = ref(true)
const countdown = ref(0)
let timer = null

const toggleMode = () => {
    isLogin.value = !isLogin.value
    resetForm()
}

const form = reactive({
    email: '',
    code: '',
    password: '',
    confirm: '',
})

const rules = {
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
    ],
    code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    confirm: [
        {
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => {
                if (!value) return callback(new Error('请确认密码'))
                if (value !== form.password)
                    return callback(new Error('两次密码不一致'))
                callback()
            },
        },
    ],
}

const handleSubmit = async () => {
    formRef.value.validate(async (valid) => {
        if (!valid) return
        try {
            if (isLogin.value) {
                const res = await Auth.login({
                    email: form.email,
                    password: form.password,
                })
                ElMessage.success('登录成功')
                AuthStore.setToken(res.token)
                AuthStore.setUser(res.user)
                router.push('/')
            } else {
                const res = await Auth.register({
                    email: form.email,
                    password: form.password,
                    code: form.code,
                })
                ElMessage.success('注册成功，请登录')
                AuthStore.setToken(res.token)
                toggleMode()
            }
        } catch (error) {
            ElMessage.error(error.message || '操作失败')
        }
    })
}

const handleSendCode = async () => {
    if (!form.email) {
        ElMessage.warning('请先填写邮箱')
        return
    }
    try {
        await Auth.sendCode({ email: form.email })
        ElMessage.success('验证码已发送')
        startCountdown()
    } catch (error) {
        ElMessage.error(error.message || '发送失败')
    }
}

const startCountdown = () => {
    countdown.value = 60
    timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
            clearInterval(timer)
            timer = null
        }
    }, 1000)
}

const resetForm = () => {
    form.email = ''
    form.code = ''
    form.password = ''
    form.confirm = ''
    formRef.value?.clearValidate()
    if (timer) {
        clearInterval(timer)
        timer = null
    }
    countdown.value = 0
}

// -------- 忘记密码功能相关 --------
const showResetDialog = ref(false)
const resetFormRef = ref()
const resetCountdown = ref(0)
let resetTimer = null

const resetPasswordForm = reactive({
    email: '',
    code: '',
    password: '',
})

const resetPasswordRules = {
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
    ],
    code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
    password: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
}

const handleResetSendCode = async () => {
    if (!resetPasswordForm.email) {
        ElMessage.warning('请先填写邮箱')
        return
    }
    try {
        await Auth.sendCode({ email: resetPasswordForm.email })
        ElMessage.success('验证码已发送')
        startResetCountdown()
    } catch (error) {
        ElMessage.error(error.message || '发送失败')
    }
}

const startResetCountdown = () => {
    resetCountdown.value = 60
    resetTimer = setInterval(() => {
        resetCountdown.value--
        if (resetCountdown.value <= 0) {
            clearInterval(resetTimer)
            resetTimer = null
        }
    }, 1000)
}

const handleResetPassword = () => {
    resetFormRef.value.validate(async (valid) => {
        if (!valid) return
        try {
            await Auth.resetPassword({
                email: resetPasswordForm.email,
                code: resetPasswordForm.code,
                newPassword: resetPasswordForm.password,
            })
            ElMessage.success('密码重置成功，请登录')
            showResetDialog.value = false
        } catch (error) {
            ElMessage.error(error.message || '重置失败')
        }
    })
}
</script>

<style scoped lang="scss">
.auth-page {
    height: 100vh;
    background: url('/ink-brush-bg.jpg') center/cover no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
}

.auth-card {
    width: 400px;
    padding: 30px;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
}

.auth-header {
    text-align: center;
    margin-bottom: 20px;
}

.auth-header h2 {
    margin-bottom: 10px;
}

.auth-form .el-form-item {
    margin-bottom: 20px;
}

.submit-btn {
    text-align: center;
}

::v-deep(.submit-btn) {
    .el-form-item__content {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 !important;
    }
}
</style>
