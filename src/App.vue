<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from 'vue'
import { StorageSerializers, useLocalStorage, useDebounceFn, usePreferredReducedMotion } from '@vueuse/core'
import { normalizeSync } from 'normalize-diacritics'
import browserPassworder from 'browser-passworder'
import ky from 'ky'
import WinParticles from './components/WinParticles.vue'
import GeobtenuLink from '@/components/GeobtenuLink.vue'
import GoogleMapsLink from '@/components/GoogleMapsLink.vue'
import FlagpediaLink from '@/components/FlagpediaLink.vue'
import { useCombobox } from '@/composables/useCombobox'

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

// A null default makes VueUse store the object as "[object Object]"
const savedState = useLocalStorage<SavedState | null>('saved', null, { serializer: StorageSerializers.object })

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

const reducedMotion = usePreferredReducedMotion()

const statusMessage = computed(() => {
  if (isValid.value) return 'Bravo, les deux réponses sont correctes !'
  if (giveup.value && answer.value) return `Dommage. Le pays était ${answer.value.rawCountry[0]}, la capitale était ${answer.value.rawCapital.join(', ')}.`
  if (validCountry.value) return 'Le pays est correct.'
  if (validCapital.value) return 'La capitale est correcte.'
  return ''
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

const countryBox = reactive(useCombobox('country', country, countryListComputed, computed(() => !!showCountryList.value)))
const capitalBox = reactive(useCombobox('capital', capital, capitalListComputed, computed(() => !!showCapitalList.value)))

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
  <main class="flex min-h-screen justify-center bg-page px-4 py-12">
    <div v-if="answer" class="w-full flex flex-col items-center">
      <WinParticles v-if="isValid && reducedMotion !== 'reduce'" />

      <!-- Header Card -->
      <div class="card bg-base-100 mb-4 w-full max-w-sm border border-line">
        <div class="card-body px-5 py-4">
          <h1>
            <!-- SVG text fills the width exactly. A white halo sits behind a dark outline, so it reads on both themes -->
            <svg viewBox="0 0 1000 150" role="img" aria-label="Drapeau du jour" class="block h-auto w-full overflow-visible">
              <defs>
                <!-- Mixes the flag 25% toward white, so dark colours like navy stand out from the dark outline -->
                <filter id="title-lighten" color-interpolation-filters="sRGB">
                  <feComponentTransfer>
                    <feFuncR type="linear" slope="0.75" intercept="0.25" />
                    <feFuncG type="linear" slope="0.75" intercept="0.25" />
                    <feFuncB type="linear" slope="0.75" intercept="0.25" />
                  </feComponentTransfer>
                </filter>
                <pattern id="title-flag" patternUnits="userSpaceOnUse" width="1000" height="150">
                  <image :href="`/flags/${answer.flag}.png`" width="1000" height="150" preserveAspectRatio="none" filter="url(#title-lighten)" />
                </pattern>
              </defs>
              <text
                x="500"
                y="112"
                text-anchor="middle"
                textLength="980"
                lengthAdjust="spacingAndGlyphs"
                class="title-text title-halo"
                aria-hidden="true"
              >Drapeau du jour</text>
              <text
                x="500"
                y="112"
                text-anchor="middle"
                textLength="980"
                lengthAdjust="spacingAndGlyphs"
                class="title-text"
                fill="url(#title-flag)"
              >Drapeau du jour</text>
            </svg>
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
      <div class="mb-8 flex flex-col items-center gap-2 w-full max-w-sm">
        <img
          v-if="answer.flag"
          :src="`/flags/${answer.flag}.png`"
          alt="Drapeau à deviner"
          class="block h-48 w-auto max-w-full select-none rounded-box border border-line object-contain"
          style="pointer-events: none"
        />
      </div>

      <!-- Input Fields -->
      <div class="mb-6 flex flex-col gap-4 w-full max-w-sm">
        <!-- Country Input -->
        <div class="dropdown dropdown-end w-full">
          <label class="floating-label w-full">
            <input
              ref="countryInput"
              v-model="country"
              type="text"
              placeholder="Nom du pays"
              autocomplete="off"
              role="combobox"
              aria-autocomplete="list"
              :aria-expanded="countryBox.open"
              :aria-controls="countryBox.listId"
              :aria-activedescendant="countryBox.activeId"
              @keydown="countryBox.onKeydown"
              autofocus
              class="input input-lg w-full"
              :class="{
                'input-success': validCountry,
              }"
            />
            <span>Nom du pays</span>
            <svg v-if="validCountry" class="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-success-strong" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
          </label>
          <ul
            v-if="countryBox.open"
            :id="countryBox.listId"
            role="listbox"
            aria-label="Suggestions de pays"
            class="menu dropdown-content z-50 mt-1 max-h-60 w-full flex-nowrap overflow-y-auto rounded-box bg-base-100 p-2 border border-line"
          >
            <li
              v-for="(value, index) in countryListComputed"
              :id="countryBox.optionId(index)"
              :key="`country_${value}${index}`"
              role="option"
              :aria-selected="index === countryBox.active"
              @mousedown.prevent
              @click="countryBox.select(value)"
            >
              <span :class="{ 'menu-active': index === countryBox.active }">{{ value }}</span>
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
              role="combobox"
              aria-autocomplete="list"
              :aria-expanded="capitalBox.open"
              :aria-controls="capitalBox.listId"
              :aria-activedescendant="capitalBox.activeId"
              @keydown="capitalBox.onKeydown"
              class="input input-lg w-full"
              :class="{
                'input-success': validCapital,
              }"
            />
            <span>Capitale du pays</span>
            <svg v-if="validCapital" class="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-success-strong" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
          </label>
          <ul
            v-if="capitalBox.open"
            :id="capitalBox.listId"
            role="listbox"
            aria-label="Suggestions de capitales"
            class="menu dropdown-content z-50 mt-1 max-h-60 w-full flex-nowrap overflow-y-auto rounded-box bg-base-100 p-2 border border-line"
          >
            <li
              v-for="(value, index) in capitalListComputed"
              :id="capitalBox.optionId(index)"
              :key="`capital_${value}${index}`"
              role="option"
              :aria-selected="index === capitalBox.active"
              @mousedown.prevent
              @click="capitalBox.select(value)"
            >
              <span :class="{ 'menu-active': index === capitalBox.active }">{{ value }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Give Up Button -->
      <div class="flex justify-center w-full max-w-sm">
        <button
          v-if="!isValid && !giveup"
          class="btn btn-ghost btn-sm font-medium text-base-content/75 underline underline-offset-4 hover:bg-base-300"
          @click="giveup = true"
        >
          Abandonner
        </button>
      </div>

      <p class="sr-only" aria-live="polite">{{ statusMessage }}</p>

      <!-- Result -->
      <div v-if="isValid || giveup" class="mt-4 flex w-full max-w-sm flex-col gap-4 rounded-box border border-line bg-base-100 p-5 pt-4">
        <div class="flex flex-col gap-1">
          <span class="text-sm leading-none font-semibold text-base-content/75">{{ isValid ? 'Bien joué' : 'Dommage, c\'était' }}</span>
          <span class="text-3xl leading-tight" style="font-family: 'Fugaz One', serif">{{ answer.rawCountry[0] }}</span>
          <span class="text-base-content/75">Capitale : <span class="font-semibold text-base-content">{{ answer.rawCapital.join(', ') }}</span></span>
        </div>
        <div class="flex gap-2">
          <GoogleMapsLink v-if="answer?.rawCountry" :raw-country="answer.rawCountry[0]" />
          <GeobtenuLink v-if="answer?.flag" :flag="answer.flag" />
          <FlagpediaLink v-if="answer?.flag" :flag="answer.flag" />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center">
      <span class="loading loading-spinner loading-lg text-primary" aria-label="Chargement"></span>
    </div>
  </main>
</template>
