FROM node:20-alpine AS builder

WORKDIR /app

COPY shared/teleshop-common-1.0.4.tgz ./shared/
COPY account-service/package*.json ./account-service/

WORKDIR /app/account-service
RUN npm ci

COPY account-service/ ./
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner

WORKDIR /app/account-service
ENV NODE_ENV=production

COPY --from=builder /app/account-service /app/account-service

EXPOSE 3002
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
