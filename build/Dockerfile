# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build backend
FROM golang:1.24.4 AS backend-builder
ENV GO111MODULE auto
COPY . /go/src/app
WORKDIR /go/src/app
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -mod=vendor -o main ./cmd/app/main.go

# Final stage
FROM alpine:3.17.10
RUN apk add --no-cache tzdata ca-certificates
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

WORKDIR /app
COPY --from=backend-builder /go/src/app/main ./main
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

CMD ["./main"]
