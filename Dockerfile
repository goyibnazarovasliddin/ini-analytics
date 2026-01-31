# Production Dockerfile for Vite Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Set environment variable for build time (Railway will inject this, but for local build we can default)
# IMPORTANT: VITE_ variables must be available during build time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_ADMIN_KEY
ENV VITE_ADMIN_KEY=$VITE_ADMIN_KEY

# Build the app
RUN npm run build

# --- Production Image ---
FROM node:20-alpine

WORKDIR /app

# Install 'serve' globally to serve static files
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/build ./build

# The 'start' script in package.json is: "serve -s build -p $PORT"
# We define EXPOSE for documentation, Railway uses $PORT
EXPOSE 3000

CMD ["serve", "-s", "build", "-p", "3000"]
