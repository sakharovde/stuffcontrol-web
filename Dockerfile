FROM node:22 AS frontend-builder
WORKDIR /app
COPY . /app
RUN corepack enable
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:22 AS backend-builder
WORKDIR /app/server
COPY server/. /app/server/
RUN corepack enable
RUN yarn install --immutable
RUN yarn build

FROM node:22-slim
WORKDIR /app/server
COPY --from=backend-builder /app/server /app/server
COPY --from=frontend-builder /app/dist /app/dist
ENV PORT=3000
ENV STATIC_DIR=/app/dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
