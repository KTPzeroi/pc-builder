# Stage 1: Build phase
FROM node:20-alpine AS builder
WORKDIR /app

# Copy ไฟล์ package เพื่อลง dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copy source code ทั้งหมด
COPY . .

# Generate Prisma Client และ Build Next.js
RUN ./node_modules/.bin/prisma generate
RUN npm run build

# Stage 2: Run phase
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]