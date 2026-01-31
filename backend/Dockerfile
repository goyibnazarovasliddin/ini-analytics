# Production Dockerfile for NestJS Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client and Build
RUN npm run build

# --- Production Image ---
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose the port (Railway will override this with $PORT)
EXPOSE 8000

# Start command
# We use start:prod which runs migrations and then starts the app
CMD ["npm", "run", "start:prod"]
