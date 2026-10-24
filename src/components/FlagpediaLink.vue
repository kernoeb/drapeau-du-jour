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
  <a class="btn btn-sm flex-1 gap-1.5 whitespace-nowrap border-line bg-base-100 font-semibold hover:bg-base-200" :href="href" rel="noopener noreferrer" target="_blank">
    Flagpedia
    <svg aria-hidden="true" class="size-3.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8" /></svg>
  </a>
</template>
