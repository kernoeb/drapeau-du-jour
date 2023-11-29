FROM node:20.10.0-alpine3.18 as build-tools
LABEL maintainer="kernoeb <kernoeb@protonmail.com>"

RUN apk add --no-cache curl bash

RUN npm install -g pnpm@8 clean-modules@2.0.6

FROM build-tools as build
LABEL maintainer="kernoeb <kernoeb@protonmail.com>"

WORKDIR /home/node/build
RUN chown -R node:node /home/node/build

USER node

# Only copy the files we need for the moment
COPY --chown=node:node package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --no-optional

# Copy all files, and build the app
COPY --chown=node:node src/ ./src/
COPY --chown=node:node public/ ./public/
COPY --chown=node:node vite.config.js ./vite.config.js
COPY --chown=node:node tailwind.config.js ./tailwind.config.js
COPY --chown=node:node postcss.config.js ./postcss.config.js
COPY --chown=node:node index.html ./index.html

RUN pnpm run build
RUN rm -rf node_modules

ENV NODE_ENV production
RUN pnpm install --prod --no-optional

RUN clean-modules --yes

FROM node:20.10.0-alpine3.18 as server
LABEL maintainer="kernoeb <kernoeb@protonmail.com>"

RUN apk --no-cache add dumb-init curl bash

# Remove some useless stuff
RUN rm -rf /usr/local/lib/node_modules/npm/ /usr/local/bin/npm /opt/yarn-*

USER node
WORKDIR /app

ENV NODE_ENV production
ENV HOST 0.0.0.0

COPY --chown=node:node server/ ./server/
COPY --chown=node:node ./resources/ ./resources/
COPY --chown=node:node --from=build /home/node/build/node_modules/ ./node_modules/
COPY --chown=node:node --from=build /home/node/build/dist/ ./dist/

HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD ["curl", "http://localhost:3000"]

EXPOSE 3000
CMD ["dumb-init", "node", "--max-old-space-size=1024", "server/app.js"]
