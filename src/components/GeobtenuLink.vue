<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  flag: string
}>()

const href = computed(() => {
  return `https://geobtenu.netlify.app/flag/${encodeURIComponent(props.flag)}`
})
</script>

<template>
  <a :href="href" target="_blank" class="link link-hover font-bold" rel="noopener noreferrer">
    ➡️&nbsp;&nbsp;Géobtenu
  </a>
</template>
