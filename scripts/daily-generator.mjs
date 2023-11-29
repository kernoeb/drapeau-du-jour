import dayjs from 'dayjs'
import { writeFileSync, readFileSync } from 'fs'

const countries = JSON.parse(readFileSync('./resources/countries.json', 'utf8'))
const countryIds = Object.keys(countries)

// iterate over date from today + 2 years
const today = dayjs()

const dailyJson = {}

for (let i = 0; i < 365 * 2; i++) {
  const d = today.add(i, 'day')
  dailyJson[d.format('YYYY-MM-DD')] = countryIds[Math.floor(Math.random() * countryIds.length)]
}

writeFileSync('./daily.json', JSON.stringify(dailyJson, null, 2))
