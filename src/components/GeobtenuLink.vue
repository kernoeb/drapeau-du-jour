<template>
  <a
    :href="href"
    target="_blank"
    class="text-gray-200 font-bold"
    rel="noopener noreferrer"
  >
    ➡️&nbsp;&nbsp;Géobtenu
  </a>
</template>

<script>
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
      return `https://geobtenu.netlify.app/flag/${encodeURIComponent(this.flag)}`
    }
  }
}
</script>
