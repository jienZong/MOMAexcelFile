<script setup lang="ts">
import excelFile from "./components/excelFile/index.vue";
</script>

<template>
  <div id="app">
    <excelFile nameExcelFile="导入" callback_url="https://zion-app.functorz.com/zero/9G6nZlvBK7x/callback/f1ac35c3-a4cb-4827-87f6-e02b5d9ce601"/>
  </div>
</template>

<style>
#app {
  height: 60vh;
}
</style>
