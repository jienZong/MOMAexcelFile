
<script setup lang="ts">
const props = defineProps<{
  globalData: Record<string, any>;
  setGlobalData: (newValue: any) => void;
  value?: string;
}>();

function onInput(e: Event) {
  props.setGlobalData({
    ...props.globalData,
    message: (e.target as HTMLInputElement)?.value,
  });
}
</script>

<template>
  <div class="container">
    <h1>this is a Vue3 Component</h1>
    <div>message from outer scope: {{ value || "no input" }}</div>
    <input @input="onInput" />
  </div>
</template>

<style>
.container {
  background: khaki;
}
</style>
