FROM rust:1.88-bookworm AS builder

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./

RUN mkdir src && \
    echo "fn main() {println!(\"dummy\")}" > src/main.rs && \
    cargo build --release && \
    rm -f target/release/deps/backend*

COPY src ./src
COPY migrations ./migrations

RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /usr/src/app/target/release/backend /app/backend
COPY --from=builder /usr/src/app/migrations /app/migrations

RUN mkdir -p /app/data/db /app/data/images

ENV DATABASE_URL=sqlite:/app/data/db/database.db \
    JWT_SECRET=replace-me-in-production \
    JWT_EXPIRATION=86400 \
    SERVER_HOST=0.0.0.0 \
    SERVER_PORT=8080 \
    UPLOAD_DIR=/app/data/images \
    RUST_LOG=info

EXPOSE 8080

CMD ["/app/backend"]