<template>
  <div class="flex justify-center">
    <div
      v-if="Object.keys(answer).length"
      class="w-full max-w-xs"
    >
      <WinParticles v-if="isValid" />
      <div class="mb-9 border-2 p-2 rounded-lg">
        <h1
          class="text-4xl font-bold text-gray-700 justify-center flex"
          style="font-family: 'Fugaz One',serif; font-weight: 200;"
        >
          <span
            class="bg-text"
            :style="{'background-image': 'linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)),url(\'/flags/' + answer.flag + '.png\')'}"
          >Drapeau du jour</span>
        </h1>
      </div>
      <div class="flex flex-col mb-9">
        <div class="flex justify-center mb-1">
          <img
            v-if="answer.flag"
            style="height: 164px; pointer-events: none;"
            class="border-2 rounded border-gray-500"
            alt="flag"
            :src="'/flags/' + answer.flag + '.png'"
          >
        </div>
        <div class="flex justify-center text-gray-400">
          {{ numberOfValidAnswers }} / 2
        </div>
      </div>
      <div class="mb-3">
        <input
          id="country"
          ref="country"
          :value="country"
          autofocus
          autocomplete="off"
          :class="{'border-red-500': country && !validCountry, 'border-green-500': validCountry}"
          class="shadow border-2 appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-md mb-3"
          type="text"
          placeholder="Nom du pays"
          @input="country = $event.target.value"
        >
        <input
          id="capital"
          ref="capital"
          :value="capital"
          autocomplete="off"
          :class="{'border-red-500': capital && !validCapital, 'border-green-500': validCapital}"
          class="shadow border-2 appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-md mb-3"
          type="text"
          placeholder="Capitale du pays"
          @input="capital = $event.target.value"
        >
      </div>
      <div
        v-if="isValid"
        class="bg-green-500 text-white px-4 py-3 rounded shadow-lg"
      >
        <p class="font-bold">
          Bravo !
          <span class="emoji">😄</span>
        </p>
        <p>
          <a
            :href="`https://www.google.com/maps/search/?api=1&query=${answer.rawCountry}`"
            target="_blank"
            class="text-gray-200"
            rel="noopener noreferrer"
          >
            - Voir sur Google Maps
          </a>
        </p>
        <p>
          <a
            :href="`https://geobtenu.netlify.app/flag/${encodeURIComponent(answer.flag)}`"
            target="_blank"
            class="text-gray-200"
            rel="noopener noreferrer"
          >
            - Géobtenu (/flag/{{ answer.flag }})
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import {normalizeSync} from 'normalize-diacritics'
import WinParticles from "./components/WinParticles.vue"
import ky from 'ky'

export default {
  components: {
    WinParticles
  },
  data() {
    return {
      answer: {},
      country: '',
      capital: ''
    }
  },
  computed: {
    validCountry() {
      return this.answer.country.includes(this.sanitize(this.country))
    },
    validCapital() {
      return this.answer.capital.includes(this.sanitize(this.capital))
    },
    isValid() {
      return this.answer.country.includes(this.sanitize(this.country))
          && this.answer.capital.includes(this.sanitize(this.capital))
    },
    numberOfValidAnswers() {
      let count = 0
      if (this.answer.country.includes(this.sanitize(this.country))) count++
      if (this.answer.capital.includes(this.sanitize(this.capital))) count++
      return count
    },
  },
  watch: {
    country() {
      this.updateLocalStorage()
    },
    capital() {
      this.updateLocalStorage()
    }
  },
  created() {
    ky.get(import.meta.env.PROD ? '/api' : 'http://localhost:7059/api').json().then(response => {
      this.answer = {
        country: response.country.map(this.sanitize),
        capital: response.capital.map(this.sanitize),
        flag: response.flag,
        rawCountry: response.country,
        date: response.date
      }

      if (localStorage.getItem('saved')) {
        try {
          const saved = JSON.parse(localStorage.getItem('saved'))
          if (saved.date === this.answer.date) {
            this.country = saved.country || ''
            this.capital = saved.capital || ''
          } else {
            localStorage.removeItem('saved')
          }
        } catch (e) {
          localStorage.removeItem('saved')
        }
      }

      this.$watch('isValid', () => {
        if (this.isValid) {
          this.closeKeyboard()
        }
      })
    })
  },
  mounted() {
    console.log("%cTricheur", "color: #FF0061; font-size: 2em; font-weight: bold;")
  },
  methods: {
    updateLocalStorage() {
      localStorage.setItem('saved', JSON.stringify({
        country: this.country || '',
        capital: this.capital || '',
        date: this.answer?.date || ''
      }))
    },
    closeKeyboard() {
      try {
        this.$refs.country.blur()
      } catch (e) {
        console.log(e)
      }
      try {
        this.$refs.capital.blur()
      } catch (e) {
        console.log(e)
      }
    },
    sanitize(str) {
      if (!str) return ''
      return normalizeSync(str).replace(/[-‘’']/g, ' ').replace(/[.*?!]/g, '').toUpperCase().trim()
    }
  }
}
</script>

<style>
body {
  background-color: #fafafa;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 60px;
}

.bg-text {
  background-size: 100% 40px;
  -webkit-background-clip: text;
  background-repeat: no-repeat;
  -webkit-text-fill-color: transparent;
  text-align: center;
  font-weight: bold;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke: 1px black;
}
</style>
