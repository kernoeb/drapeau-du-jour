<template>
  <a
    :href="`https://www.google.com/maps/search/?api=1&query=Pays%20${encodeURIComponent(rawCountry)}`"
    target="_blank"
    class="text-gray-200"
    rel="noopener noreferrer"
  >
    - Voir sur Google Maps
  </a>
</template>

<script>
export default {
  name: 'GoogleMapsLink',
  props: {
    rawCountry: {
      type: String,
      required: true
    }
  }
}
</script>
