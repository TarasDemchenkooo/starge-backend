FROM node:20-alpine3.20 as development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

FROM node:20-alpine3.20 as build
WORKDIR /app
COPY --from=development /app/node_modules ./node_modules
COPY . .
ARG APP
RUN npm run build ${APP}
RUN npm ci --omit=dev

FROM node:20-alpine3.20 as production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
ARG APP
COPY --from=build /app/dist/apps/${APP} ./dist
CMD ["node", "dist/main.js"]