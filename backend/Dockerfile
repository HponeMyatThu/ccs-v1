FROM rust:1.78 AS builder

WORKDIR /usr/src/app

COPY Cargo.toml ./
COPY src ./src
COPY migrations ./migrations

RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /usr/src/app/target/release/backend /app/backend
COPY --from=builder /usr/src/app/migrations /app/migrations

RUN mkdir -p /app/data/db /app/data/images

ENV DATABASE_URL=sqlite:/app/data/db/database.db
ENV JWT_SECRET=your-secret-key-change-this-in-production
ENV JWT_EXPIRATION=86400
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=8080
ENV UPLOAD_DIR=/app/data/images
ENV RUST_LOG=info

EXPOSE 8080

CMD ["/app/backend"]
