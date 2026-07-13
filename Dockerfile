# =========================================================
# Stage 1: Build Phase
# =========================================================
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies required for building
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Run the build script (Produces client static dist/ and compiled dist/server.cjs)
RUN npm run build

# =========================================================
# Stage 2: Production Runtime Phase
# =========================================================
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only to minimize image size and attack surface
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled bundles from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose production port
EXPOSE 3000

# Start server using the production start script
CMD ["npm", "run", "start"]
