<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  rawCountry: string
}>()

const href = computed(() => {
  return `https://www.google.com/maps/search/?api=1&query=Pays%20${encodeURIComponent(props.rawCountry)}`
})
</script>

<template>
  <a :href="href" target="_blank" class="link link-hover font-bold" rel="noopener noreferrer">
    ➡️&nbsp;&nbsp;Voir sur Google Maps
  </a>
</template>
