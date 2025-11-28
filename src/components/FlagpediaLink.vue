<script setup lang="ts">
import { computed } from 'vue'
import flagpedia from '@/assets/flagpedia.json'

const props = defineProps<{
  flag: string
}>()

const href = computed(() => {
  return (flagpedia as Record<string, string>)[props.flag] || 'https://flagpedia.net'
})
</script>

<template>
  <a :href="href" target="_blank" class="link link-hover font-bold" rel="noopener noreferrer">
    ➡️&nbsp;&nbsp;Flagpedia.net
  </a>
</template>
