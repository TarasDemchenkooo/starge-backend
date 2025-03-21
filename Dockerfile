FROM node:20-alpine3.20 AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

FROM node:20-alpine3.20 AS build
WORKDIR /app
COPY --from=development /app/node_modules ./node_modules
COPY . .
ARG APP
RUN npm run build ${APP}
RUN npm ci --only=prod

FROM node:20-alpine3.20
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
ARG APP
COPY --from=build /app/dist/apps/${APP} ./dist
CMD ["node", "dist/main"]
