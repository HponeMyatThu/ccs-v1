# --- BUILD STAGE ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files for better caching
COPY package*.json ./

# Install dependencies (using npm ci for faster, more reliable builds)
RUN npm ci

# Copy the rest of your source code
COPY . .

# Run the build script (Vite produces the /dist folder)
RUN npm run build

# --- PRODUCTION STAGE ---
FROM nginx:stable-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom nginx config if you have one (recommended for React Router)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]