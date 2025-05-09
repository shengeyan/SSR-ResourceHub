<template>
    <AdminDashboardPage />
</template>

<script setup>
import AdminDashboardPage from '~/components/PageView/AdminDashboardPage.vue'

definePageMeta({
    middleware: 'auth',
})
</script>
