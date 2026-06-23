# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- runtime stage ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json astro.config.mjs ./
RUN npm ci --omit=dev

# @astrojs/node "standalone" build çıktısı: dist/server + dist/client
COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

# POCKETBASE_URL çalışma zamanında (docker-compose'dan) verilir.
# "astro preview", build çıktısını (dist) @astrojs/node standalone server üzerinden serve eder.
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4321"]
