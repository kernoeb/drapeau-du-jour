<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useLocalStorage, useDebounceFn } from '@vueuse/core'
import { normalizeSync } from 'normalize-diacritics'
import browserPassworder from 'browser-passworder'
import ky from 'ky'
import WinParticles from './components/WinParticles.vue'
import GeobtenuLink from '@/components/GeobtenuLink.vue'
import GoogleMapsLink from '@/components/GoogleMapsLink.vue'
import FlagpediaLink from '@/components/FlagpediaLink.vue'

interface Answer {
  country: string[]
  capital: string[]
  flag: string
  rawCountry: string[]
  rawCapital: string[]
  date: string
}

interface ApiResponse {
  country: string[]
  capital: string[]
  flag: string
  date: string
}

interface SavedState {
  country: string
  capital: string
  date: string
}

const answer = ref<Answer | null>(null)
const country = ref('')
const capital = ref('')
const giveup = ref(false)
const countryList = ref<string[]>([])
const capitalList = ref<string[]>([])
const normalizeCache = ref<Record<string, string>>({})

const countryInput = ref<HTMLInputElement | null>(null)
const capitalInput = ref<HTMLInputElement | null>(null)

const savedState = useLocalStorage<SavedState | null>('saved', null)

function sanitize(str: string): string {
  if (!str) return ''
  return normalizeSync(str).replace(/[-''']/g, ' ').replace(/[.*?!]/g, '').toUpperCase().trim()
}

function getCachedNormalized(value: string): string {
  if (!normalizeCache.value[value]) {
    normalizeCache.value[value] = normalizeSync(value)
  }
  return normalizeCache.value[value]
}

const normalizedCountry = computed(() => sanitize(country.value))
const normalizedCapital = computed(() => sanitize(capital.value))

const countryListComputed = computed(() => {
  return countryList.value.filter((v) => {
    if (!v) return false
    const normalized = getCachedNormalized(v)
    return normalized?.toLowerCase().includes(normalizedCountry.value.toLowerCase())
  })
})

const capitalListComputed = computed(() => {
  return capitalList.value.filter((v) => {
    if (!v) return false
    const normalized = getCachedNormalized(v)
    return normalized?.toLowerCase().includes(normalizedCapital.value.toLowerCase())
  })
})

const validCountry = computed(() => {
  return answer.value?.country.includes(sanitize(country.value)) ?? false
})

const validCapital = computed(() => {
  return answer.value?.capital.includes(sanitize(capital.value)) ?? false
})

const showCountryList = computed(() => {
  return country.value?.trim() && countryListComputed.value.length && !validCountry.value
})

const showCapitalList = computed(() => {
  return capital.value?.trim() && capitalListComputed.value.length && !validCapital.value
})

const isValid = computed(() => validCountry.value && validCapital.value)

const numberOfValidAnswers = computed(() => {
  let count = 0
  if (validCountry.value) count++
  if (validCapital.value) count++
  return count
})

const updateLocalStorage = useDebounceFn(() => {
  savedState.value = {
    country: country.value || '',
    capital: capital.value || '',
    date: answer.value?.date || '',
  }
}, 300)

watch([country, capital], () => {
  updateLocalStorage()
})

watch(isValid, (newValue) => {
  if (newValue) {
    closeKeyboard()
  }
})

function closeKeyboard() {
  countryInput.value?.blur()
  capitalInput.value?.blur()
}

function selectCountry(value: string) {
  country.value = value
}

function selectCapital(value: string) {
  capital.value = value
}

onMounted(async () => {
  console.clear()
  console.log('%cTricheur', 'color: #FF0061; font-size: 10em; font-weight: bold;')
  console.log('%cPlus compliqué maintenant', 'color: #FF0061; font-size: 2em; font-weight: bold;')

  const r = await ky.get('/api')
  const json = await r.text()
  const response = await browserPassworder.decrypt<ApiResponse>(r.headers.get('X-Flag-Date') ?? '', json)

  countryList.value = await ky.get('/countries').json<string[]>()
  capitalList.value = await ky.get('/capitals').json<string[]>()

  answer.value = {
    country: response.country.map(sanitize),
    capital: response.capital.map(sanitize),
    flag: response.flag,
    rawCountry: response.country,
    rawCapital: response.capital,
    date: response.date,
  }

  if (savedState.value) {
    if (savedState.value.date === answer.value.date) {
      country.value = savedState.value.country || ''
      capital.value = savedState.value.capital || ''
    } else {
      savedState.value = null
    }
  }
})
</script>

<template>
  <div class="flex min-h-screen justify-center bg-base-200 px-4 py-12">
    <div v-if="answer" class="w-full flex flex-col items-center">
      <WinParticles v-if="isValid" />

      <!-- Header Card -->
      <div class="card card-border bg-base-100 mb-4 shadow-md">
        <div class="card-body items-center py-4 px-8">
          <h1
            class="text-5xl tracking-wide whitespace-nowrap"
            style="font-family: 'Fugaz One', serif"
          >
            <span
              :style="{
                backgroundImage: `url('/flags/${answer.flag}.png')`,
                backgroundSize: '200%',
                backgroundPosition: 'center',
              }"
              class="bg-text"
            >
              Drapeau du jour
            </span>
          </h1>
        </div>
      </div>

      <!-- GitHub Link -->
      <div class="mb-6 flex justify-center">
        <a
          href="https://github.com/kernoeb/drapeau-du-jour/"
          rel="noopener noreferrer"
          target="_blank"
          class="link link-hover text-sm text-base-content/60"
        >
          github.com/<span class="font-bold">kernoeb</span>/drapeau-du-jour
        </a>
      </div>

      <!-- Flag Display -->
      <div class="mb-8 flex flex-col items-center gap-2 w-full max-w-sm px-4">
        <figure class="overflow-hidden rounded-lg border-2 border-base-300 shadow-lg">
          <img
            v-if="answer.flag"
            :src="`/flags/${answer.flag}.png`"
            alt="flag"
            class="h-40 select-none object-contain"
            style="pointer-events: none"
          />
        </figure>
        <div class="badge badge-lg badge-outline">{{ numberOfValidAnswers }} / 2</div>
      </div>

      <!-- Input Fields -->
      <div class="mb-6 flex flex-col gap-4 w-full max-w-sm px-4">
        <!-- Country Input -->
        <div class="dropdown dropdown-end w-full">
          <label class="floating-label w-full">
            <input
              ref="countryInput"
              v-model="country"
              type="text"
              placeholder="Nom du pays"
              autocomplete="off"
              autofocus
              class="input input-lg w-full"
              :class="{
                'input-error': country && !validCountry,
                'input-success': validCountry,
              }"
            />
            <span>Nom du pays</span>
          </label>
          <ul
            v-if="showCountryList"
            class="menu dropdown-content z-50 mt-1 max-h-60 w-full flex-nowrap overflow-y-auto rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
          >
            <li v-for="(value, index) in countryListComputed" :key="`country_${value}${index}`">
              <button type="button" @click="selectCountry(value)">{{ value }}</button>
            </li>
          </ul>
        </div>

        <!-- Capital Input -->
        <div class="dropdown dropdown-end w-full">
          <label class="floating-label w-full">
            <input
              ref="capitalInput"
              v-model="capital"
              type="text"
              placeholder="Capitale du pays"
              autocomplete="off"
              class="input input-lg w-full"
              :class="{
                'input-error': capital && !validCapital,
                'input-success': validCapital,
              }"
            />
            <span>Capitale du pays</span>
          </label>
          <ul
            v-if="showCapitalList"
            class="menu dropdown-content z-50 mt-1 max-h-60 w-full flex-nowrap overflow-y-auto rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
          >
            <li v-for="(value, index) in capitalListComputed" :key="`capital_${value}${index}`">
              <button type="button" @click="selectCapital(value)">{{ value }}</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Give Up Button -->
      <div class="flex justify-center w-full max-w-sm px-4">
        <button
          v-if="!isValid && !giveup"
          class="btn btn-warning btn-wide"
          @click="giveup = true"
        >
          Abandonner
        </button>
      </div>

      <!-- Success Alert -->
      <div v-if="isValid" class="alert alert-success mt-4 shadow-lg w-full max-w-sm px-4">
        <div>
          <span class="text-lg font-bold">Bravo ! 😄</span>
        </div>
        <div class="mt-3 flex flex-col gap-1">
          <GoogleMapsLink v-if="answer?.rawCountry" :raw-country="answer.rawCountry[0]" />
          <GeobtenuLink v-if="answer?.flag" :flag="answer.flag" />
          <FlagpediaLink v-if="answer?.flag" :flag="answer.flag" />
        </div>
      </div>

      <!-- Give Up Alert -->
      <div v-if="!isValid && giveup" class="alert alert-warning mt-4 shadow-lg w-full max-w-sm px-4">
        <div>
          <span class="text-lg font-bold">Dommage 😔</span>
          <div class="mt-2 space-y-1">
            <p>
              Le pays était <span class="font-bold">{{ answer.rawCountry[0] }}</span>
            </p>
            <p>
              La capitale était
              <span class="font-bold">{{ answer.rawCapital.join(', ') }}</span>
            </p>
          </div>
        </div>
        <div class="mt-3 flex flex-col gap-1">
          <GoogleMapsLink v-if="answer?.rawCountry" :raw-country="answer.rawCountry[0]" />
          <GeobtenuLink v-if="answer?.flag" :flag="answer.flag" />
          <FlagpediaLink v-if="answer?.flag" :flag="answer.flag" />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
  </div>
</template>
