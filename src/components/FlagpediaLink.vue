<template>
  <a
    :href="href"
    target="_blank"
    class="text-gray-200 font-bold"
    rel="noopener noreferrer"
  >
    ➡️&nbsp;&nbsp;Flagpedia.net
  </a>
</template>

<script>
import flagpedia from '@/assets/flagpedia.json'

export default {
  name: 'GeobtenuLink',
  props: {
    flag: {
      type: String,
      required: true
    }
  },
  computed: {
    href () {
      return flagpedia[this.flag] || 'https://flagpedia.net'
    }
  }
}
</script>
