FROM node:22 AS builder
WORKDIR /app
COPY . /app
RUN corepack enable
RUN yarn install --immutable
RUN yarn workspace client build
RUN yarn workspace server build

FROM node:22-slim
WORKDIR /app/apps/server
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/server/node_modules /app/apps/server/node_modules
COPY --from=builder /app/apps/server/dist /app/apps/server/dist
COPY --from=builder /app/apps/server/package.json /app/apps/server/package.json
COPY --from=builder /app/dist /app/dist
ENV NODE_ENV=production
ENV PORT=3000
ENV RENDER=1
ENV STATIC_DIR=/app/dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
