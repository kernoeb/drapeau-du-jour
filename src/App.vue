<template>
  <div class="flex justify-center">
    <div
      v-if="Object.keys(answer).length"
      class="w-full max-w-xs"
    >
      <WinParticles v-if="isValid" />
      <div class="border-2 p-2 rounded-lg">
        <h1
          class="mb-1 text-4xl font-bold text-gray-700 justify-center flex"
          style="font-family: 'Fugaz One',serif; font-weight: 200;"
        >
          <span
            :style="{'background-image': 'linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)),url(\'/flags/' + answer.flag + '.png\')'}"
            class="bg-text"
          >Drapeau du jour</span>
        </h1>
      </div>
      <div class="mb-9 justify-center flex italic text-gray-400 hover:text-blue-700 text-sm">
        <a
          href="https://github.com/kernoeb/drapeau-du-jour/"
          rel="noopener noreferrer"
          target="_blank"
        >github.com/<b>kernoeb</b>/drapeau-du-jour</a>
      </div>
      <div class="flex flex-col mb-9">
        <div class="flex justify-center mb-1">
          <img
            v-if="answer.flag"
            :src="'/flags/' + answer.flag + '.png'"
            alt="flag"
            class="border-2 rounded border-gray-500"
            style="height: 164px; pointer-events: none;"
          >
        </div>
        <div class="flex justify-center text-gray-400">
          {{ numberOfValidAnswers }} / 2
        </div>
      </div>
      <div class="mb-3">
        <div class="w-full relative mb-3">
          <input
            id="country"
            ref="country"
            :class="{'border-red-500': country && !validCountry, 'border-green-500': validCountry}"
            :value="country"
            autocomplete="off"
            autofocus
            class="shadow border-2 appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-md"
            placeholder="Nom du pays"
            type="text"
            @input="country = $event.target.value"
          >
          <div
            v-if="showCountryList"
            style="max-height: 300px;"
            class="absolute w-full z-50 bg-white border border-gray-300 max-height-48 overflow-y-auto overflow-y-scroll shadow-md scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-100 overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
          >
            <ul class="py-1">
              <li
                v-for="(value, index) in countryListComputed"
                :key="'country_' + value + index"
                class="px-3 py-2 cursor-pointer hover:bg-gray-200"
                @click="country = value"
              >
                {{ value }}
              </li>
            </ul>
          </div>
        </div>
        <div class="w-full relative mb-3">
          <input
            id="capital"
            ref="capital"
            :class="{'border-red-500': capital && !validCapital, 'border-green-500': validCapital}"
            :value="capital"
            autocomplete="off"
            class="shadow border-2 appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-md"
            placeholder="Capitale du pays"
            type="text"
            @input="capital = $event.target.value"
          >
          <div
            v-if="showCapitalList"
            style="max-height: 300px;"
            class="absolute w-full z-50 bg-white border border-gray-300 max-height-48 overflow-y-auto overflow-y-scroll shadow-md scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-100 overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
          >
            <ul class="py-1">
              <li
                v-for="(value, index) in capitalListComputed"
                :key="'capital_' + value + index"
                class="px-3 py-2 cursor-pointer hover:bg-gray-200"
                @click="capital = value"
              >
                {{ value }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="justify-center flex">
        <button
          v-if="!isValid && !giveup"
          class="bg-orange-500 hover:bg-orange-400 text-white font-bold py-1 px-3 border-b-4 border-orange-700 hover:border-orange-500 rounded"
          @click="giveup = true"
        >
          Abandonner
        </button>
      </div>
      <div
        v-if="isValid"
        class="bg-green-500 text-white px-4 py-3 rounded shadow-lg"
      >
        <p class="font-bold">
          Bravo !
          <span class="emoji">😄</span>
        </p>
        <p class="mt-3">
          <GoogleMapsLink
            v-if="answer?.rawCountry"
            :raw-country="answer.rawCountry[0]"
          />
        </p>
        <p>
          <GeobtenuLink
            v-if="answer?.flag"
            :flag="answer.flag"
          />
        </p>
        <p>
          <FlagpediaLink
            v-if="answer?.flag"
            :flag="answer.flag"
          />
        </p>
      </div>
      <div
        v-if="!isValid && giveup"
        class="bg-orange-500 text-white px-4 py-3 rounded shadow-lg"
      >
        <p class="font-bold">
          Dommage
          <span class="emoji">😔</span>
        </p>
        <div class="p-1">
          <div>Le pays était <span class="font-bold">{{ answer.rawCountry[0] }}</span></div>
          <div>La capitale était <span class="font-bold">{{ answer.rawCapital.join(', ') }}</span></div>
        </div>
        <p class="mt-3">
          <GoogleMapsLink
            v-if="answer?.rawCountry"
            :raw-country="answer.rawCountry[0]"
          />
        </p>
        <p>
          <GeobtenuLink
            v-if="answer?.flag"
            :flag="answer.flag"
          />
        </p>
        <p>
          <FlagpediaLink
            v-if="answer?.flag"
            :flag="answer.flag"
          />
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { normalizeSync } from 'normalize-diacritics'
import WinParticles from './components/WinParticles.vue'
import GeobtenuLink from '@/components/GeobtenuLink.vue'
import GoogleMapsLink from '@/components/GoogleMapsLink.vue'
import FlagpediaLink from '@/components/FlagpediaLink.vue'
import browserPassworder from 'browser-passworder'
import ky from 'ky'

export default {
  components: {
    GeobtenuLink,
    GoogleMapsLink,
    WinParticles,
    FlagpediaLink
  },
  data () {
    return {
      answer: {},
      country: '',
      capital: '',
      giveup: false,
      countryList: [],
      capitalList: [],
      normalizeCache: {}
    }
  },
  computed: {
    normalizedCountry () {
      return this.sanitize(this.country)
    },
    countryListComputed () {
      return this.countryList.filter(v => {
        if (!v) return false

        let normalized = this.normalizeCache[v]
        if (!normalized) {
          normalized = normalizeSync(v)
          this.normalizeCache[v] = normalized
        }

        return normalized && normalized.toLowerCase().includes(this.normalizedCountry.toLowerCase())
      })
    },
    normalizedCapital () {
      return this.sanitize(this.capital)
    },
    capitalListComputed () {
      return this.capitalList.filter(v => {
        if (!v) return false

        let normalized = this.normalizeCache[v]
        if (!normalized) {
          normalized = normalizeSync(v)
          this.normalizeCache[v] = normalized
        }

        return normalized && normalized.toLowerCase().includes(this.normalizedCapital.toLowerCase())
      })
    },
    showCountryList () {
      return this.country?.trim() && this.countryListComputed.length && !this.validCountry
    },
    showCapitalList () {
      return this.capital?.trim() && this.capitalListComputed.length && !this.validCapital
    },
    validCountry () {
      return this.answer.country.includes(this.sanitize(this.country))
    },
    validCapital () {
      return this.answer.capital.includes(this.sanitize(this.capital))
    },
    isValid () {
      return this.answer.country.includes(this.sanitize(this.country)) &&
        this.answer.capital.includes(this.sanitize(this.capital))
    },
    numberOfValidAnswers () {
      let count = 0
      if (this.answer.country.includes(this.sanitize(this.country))) count++
      if (this.answer.capital.includes(this.sanitize(this.capital))) count++
      return count
    }
  },
  watch: {
    country () {
      this.updateLocalStorage()
    },
    capital () {
      this.updateLocalStorage()
    }
  },
  async created () {
    const r = await ky.get(import.meta.env.PROD ? '/api' : 'http://localhost:7059/api')
    const json = await r.text()
    const response = await browserPassworder.decrypt(r.headers.get('X-Flag-Date'), json) // just to avoid really easy cheating

    this.countryList = await ky.get(import.meta.env.PROD ? '/countries' : 'http://localhost:7059/countries').json()
    this.capitalList = await ky.get(import.meta.env.PROD ? '/capitals' : 'http://localhost:7059/capitals').json()

    this.answer = {
      country: response.country.map(this.sanitize),
      capital: response.capital.map(this.sanitize),
      flag: response.flag,
      rawCountry: response.country,
      rawCapital: response.capital,
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
  },
  mounted () {
    console.clear()
    console.log('%cTricheur', 'color: #FF0061; font-size: 10em; font-weight: bold;')
    console.log('%cPlus compliqué maintenant', 'color: #FF0061; font-size: 2em; font-weight: bold;')
  },
  methods: {
    updateLocalStorage () {
      localStorage.setItem('saved', JSON.stringify({
        country: this.country || '',
        capital: this.capital || '',
        date: this.answer?.date || ''
      }))
    },
    closeKeyboard () {
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
    sanitize (str) {
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
