import { createServer } from 'http'
import { createApp, eventHandler, fromNodeMiddleware, toNodeListener } from 'h3'
import fs from 'fs'
import path from 'path'
import serveStatic from 'serve-static'
import dayjs from 'dayjs'
import compression from 'compression'

import passworder from 'browser-passworder'

const dailyJson = process.env.NODE_ENV === 'production' ? 'daily.json' : './dev/daily.json'
if (!fs.existsSync(dailyJson)) {
  console.error('daily.json not found')
  process.exit(1)
}

console.log('NODE_ENV:', process.env.NODE_ENV)

const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), dailyJson), 'utf8'))
const countries = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/resources/countries.json'), 'utf8'))

const countryNames = Object.keys(countries).map((key) => countries[key].country).flat().sort((a, b) => a.localeCompare(b))
const capitals = Object.keys(countries).map((key) => countries[key].capital).flat().sort((a, b) => a.localeCompare(b))

const app = createApp()

app.use(fromNodeMiddleware(compression()))

const s = path.join(process.cwd(), '/dist/')
app.use(fromNodeMiddleware(serveStatic(s)))

app.use('/api', fromNodeMiddleware((req, res) => {
  const d = dayjs().format('YYYY-MM-DD')
  const todayFlag = data[d]
  const ret = countries[todayFlag]
  ret.flag = todayFlag
  ret.date = d

  res.setHeader('X-Flag-Date', d)
  res.setHeader('Content-Type', 'application/json')
  return passworder.encrypt(d, ret)
}))

app.use('/countries', eventHandler(() => countryNames))
app.use('/capitals', eventHandler(() => capitals))

createServer(toNodeListener(app)).listen(process.env.PORT || 3000)
