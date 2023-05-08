module.exports = {
  env: {
    node: true
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    withDefaults: 'readonly'
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ]
}
