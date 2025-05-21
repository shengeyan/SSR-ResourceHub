<template>
  <div class="loading-overlay">
      <el-spinner size="large" class="loading-spinner" />
      <div class="loading-text">资源加载中，请稍候...</div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 20px;
}

.loading-text {
  font-size: 16px;
  color: #888;
}
</style>
