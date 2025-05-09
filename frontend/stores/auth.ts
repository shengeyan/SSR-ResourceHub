import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: '' as string,
        user: null as null | {
            id: string
            email: string
            username: string
            avatar: string
            emailVerified?: boolean
            createdAt?: string
        },
        loginStatus: false as boolean,
    }),

    actions: {
        setLoginStatus(status: boolean) {
            this.loginStatus = status
        },
        setToken(token: string) {
            this.token = token
            localStorage.setItem('token', token)
        },
        setUser(user: any) {
            this.user = user
            this.loginStatus = true
        },
        logout() {
            this.token = ''
            this.user = null
            this.loginStatus = false
            localStorage.removeItem('token')
        },
    },
    // persist: true,
})
