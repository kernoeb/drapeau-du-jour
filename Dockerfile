FROM oven/bun:1.4.4-slim@sha256:1846adf22496bd711036aae8be147e57bdebbaea2e5264e3e0b5af1db187d9a4 AS build
LABEL maintainer="kernoeb <kernoeb@protonmail.com>"

WORKDIR /app

# Cache packages
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY src/ ./src/
COPY public/ ./public/
COPY server/ ./server/
COPY resources/ ./resources/
COPY index.html vite.config.ts tsconfig.json tsconfig.node.json ./

ENV NODE_ENV=production
RUN bun run build && bun run build:server


##########################################################
FROM cgr.dev/chainguard/glibc-dynamic:latest@sha256:2827063c9efb4ba971d8621eb75f4e61b8d19850a6293a797df37358cc6f687b
LABEL maintainer="kernoeb <kernoeb@protonmail.com>"

WORKDIR /app

COPY --from=ghcr.io/tarampampam/microcheck:1@sha256:c9f79cd408626de7c10f2d487d67339f49adf0ba61dde96ede65343269db1f85 /bin/httpcheck /bin/httpcheck

COPY --from=build /app/server/ddj ./server
COPY --from=build /app/dist/ ./dist/

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD ["/bin/httpcheck", "http://127.0.0.1:3000/countries"]

EXPOSE 3000
CMD ["./server"]
