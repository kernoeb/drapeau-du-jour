<h1 align="center">
  <br>
  <a href="https://drapeaudujour.noewen.com/"><img src="https://raw.githubusercontent.com/kernoeb/drapeau-du-jour/main/public/favicon.png" alt="Drapeau du jour" width="80"></a>
  <br>
  Drapeau du jour
  <br>
</h1>

<p align="center">Every day, guess the country and the capital of a new flag.</p>

![Drapeau du jour after a correct answer: the French flag, both answers checked and the result card](public/capture.png)

> Vue 3 + Vite + Tailwind CSS with daisyUI, served by Bun as a single compiled binary

### Before you start

The server reads the flag of each day from a `daily.json` file. Each key is a date, each value a country code from `resources/countries.json`:

```json
{
  "2022-03-25": "fr",
  "2022-03-26": "de",
  "2022-03-27": "it"
}
```

To generate 3 years of random flags from today:

```bash
bun scripts/daily-generator.mjs
```

### Develop

You need [Bun](https://bun.com) 1.4.4, the version in `.bun-version`.

```bash
bun install
mkdir -p dev && cp daily.json dev/daily.json  # outside production, the server reads dev/daily.json
bun run dev-server  # API on port 7059
bun run dev         # Vite, which proxies /api, /countries and /capitals to the API
```

Before you push, run `bun run typecheck` and `bun run build`.

### Deploy

```bash
docker-compose pull && docker-compose up -d --remove-orphans
```

The image mounts `daily.json` from the host. The `TZ` variable in `docker-compose.yml` decides when a new day, and so a new flag, starts.
