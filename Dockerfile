FROM node:22 AS builder
WORKDIR /app
COPY . /app
RUN corepack enable
RUN yarn install --frozen-lockfile
COPY . /app
RUN yarn build

FROM node:22
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.yarn ./.yarn
RUN yarn init -y
RUN yarn add serve
EXPOSE 3000
CMD ["yarn", "serve", "./dist"]