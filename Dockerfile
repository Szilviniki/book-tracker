# node:sqlite miatt legalább Node 22.13 kell; a slim (glibc) image-en a sharp előre fordított binárisa fut
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-slim
WORKDIR /app
# AUTH_TRUST_HOST: a Coolify proxy mögött az Auth.js a kérés hostját használja a visszahívási URL-hez
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 AUTH_TRUST_HOST=true
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Az adatbázis itt van; Coolify-ban erre a mappára kell tartós volume-ot csatolni
RUN mkdir data && chown node:node data
VOLUME /app/data
USER node
EXPOSE 3000
CMD ["node", "server.js"]
