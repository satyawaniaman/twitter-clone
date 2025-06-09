FROM node:18-alpine AS base

# Create app directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install 

# Copy source code
COPY . .

# Install needed type definitions
RUN pnpm add -D @types/cors

# Generate Prisma client
RUN pnpx prisma generate

# Build the application
RUN pnpm build

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application from base stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/prisma ./prisma

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "dist/server.js"] 