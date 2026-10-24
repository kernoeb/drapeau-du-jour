import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import passworder from 'browser-passworder'
import dayjs from 'dayjs'
import countries from '../resources/countries.json'

interface Country { country: string[], capital: string[] }

const dailyJson = process.env.NODE_ENV === 'production' ? 'daily.json' : './dev/daily.json'
if (!fs.existsSync(dailyJson)) {
  console.error('daily.json not found')
  process.exit(1)
}

console.log('NODE_ENV:', process.env.NODE_ENV)

const data: Record<string, string> = JSON.parse(fs.readFileSync(path.join(process.cwd(), dailyJson), 'utf8'))
const countryMap: Record<string, Country> = countries

const countryNames = Object.values(countryMap).flatMap(c => c.country).sort((a, b) => a.localeCompare(b))
const capitals = Object.values(countryMap).flatMap(c => c.capital).sort((a, b) => a.localeCompare(b))

const distDir = path.join(process.cwd(), 'dist')

function decodePath(pathname: string) {
  try {
    const decoded = decodeURIComponent(pathname)
    return decoded.includes('\0') ? null : decoded
  } catch {
    return null
  }
}

function fileResponse(file: Blob, pathname: string) {
  const headers = new Headers()
  // Vite puts a content hash in every file name under /assets/
  if (pathname.startsWith('/assets/')) headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  return new Response(file, { headers })
}

async function serveStatic(pathname: string) {
  const decoded = decodePath(pathname)
  if (decoded === null) return new Response('Bad Request', { status: 400 })

  const filePath = path.join(distDir, decoded)
  if (!filePath.startsWith(distDir + path.sep)) return null

  const file = Bun.file(filePath)
  if (await file.exists()) return fileResponse(file, pathname)

  const index = Bun.file(path.join(filePath, 'index.html'))
  if (await index.exists()) return fileResponse(index, pathname)
  return null
}

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(req) {
    const { pathname } = new URL(req.url)

    if (pathname === '/api' || pathname.startsWith('/api/')) {
      const d = dayjs().format('YYYY-MM-DD')
      const todayFlag = data[d]
      const country = todayFlag ? countryMap[todayFlag] : undefined
      if (!todayFlag || !country) {
        console.error(`No known flag for ${d} in daily.json`)
        return new Response('No flag for today', { status: 503 })
      }
      // A copy, so concurrent requests never share or change the country data
      const ret = { ...country, flag: todayFlag, date: d }

      return new Response(await passworder.encrypt(d, ret), {
        headers: { 'X-Flag-Date': d, 'Content-Type': 'application/json' },
      })
    }
    if (pathname === '/countries') return Response.json(countryNames)
    if (pathname === '/capitals') return Response.json(capitals)

    return await serveStatic(pathname) ?? new Response('Not Found', { status: 404 })
  },
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await server.stop()
    process.exit(0)
  })
}
