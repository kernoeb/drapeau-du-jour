const { listen } = require('listhen')
const { createApp } = require('h3')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const serveStatic = require('serve-static')
const dayjs = require('dayjs')

const dailyJson = process.env.NODE_ENV === 'production' ? 'daily.json' : './dev/daily.json'
if (!fs.existsSync(dailyJson)) {
  console.error('daily.json not found')
  process.exit(1)
}

console.log("NODE_ENV:", process.env.NODE_ENV)

const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), dailyJson), 'utf8'))
const countries = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/resources/countries.json'), 'utf8'))

const app = createApp()
app.use(cors())

const s = path.join(process.cwd(), '/dist/')
app.use(serveStatic(s))

app.use('/api', () => {
  const d = dayjs().format('YYYY-MM-DD')
  const todayFlag = data[d]
  const ret = countries[todayFlag]
  ret.flag = todayFlag
  ret.date = d
  return ret
})

listen(app).then(r => console.log(`Listening on ${r.url}`))
