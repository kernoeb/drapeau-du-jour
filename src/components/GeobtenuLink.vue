<template>
  <a
    :href="`https://geobtenu.netlify.app/flag/${encodeURIComponent(flag)}`"
    target="_blank"
    class="text-gray-200"
    rel="noopener noreferrer"
  >
    - Géobtenu (/flag/{{ flag }})
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
  }
}
</script>
