FROM node:22 AS frontend-builder
WORKDIR /app
COPY . /app
RUN corepack enable
RUN yarn install --frozen-lockfile
COPY . /app
RUN yarn build

FROM golang:1.23 AS backend-builder
WORKDIR /app/server
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /app/bin/stuffcontrol ./cmd/server

FROM gcr.io/distroless/base-debian12
WORKDIR /app/server
COPY --from=backend-builder /app/bin/stuffcontrol ./stuffcontrol
COPY --from=frontend-builder /app/dist /app/dist
ENV PORT=3000
ENV STATIC_DIR=/app/dist
EXPOSE 3000
CMD ["./stuffcontrol"]
