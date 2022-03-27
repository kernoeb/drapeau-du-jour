module.exports = {
  env: {
    node: true
  },
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    withDefaults: "readonly"
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended"
  ],
  rules: {
    "no-trailing-spaces": "error",
    "semi": ["error", "never"],
    indent: ["error", 2],
    "comma-dangle": "error"
  }
}
