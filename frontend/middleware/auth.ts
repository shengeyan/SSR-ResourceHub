export default defineNuxtRouteMiddleware(() => {
    const authStore = useAuthStore()

    if (!authStore.loginStatus) {
        return navigateTo('/')
    }
})
