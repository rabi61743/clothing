# Multi-stage Dockerfile for Go backend
FROM golang:alpine AS builder

WORKDIR /app

# Enable automatic toolchain switching if go.mod requires newer version
ENV GOTOOLCHAIN=auto

# Install ca-certificates and git
RUN apk add --no-cache ca-certificates git

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build static binary
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /app/bin/clothing-server ./cmd/server

# Final minimal production image
FROM alpine:3.20

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/bin/clothing-server /app/clothing-server

EXPOSE 8080

ENTRYPOINT ["/app/clothing-server"]
