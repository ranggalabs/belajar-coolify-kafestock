# Stage 1: Build React + Vite + TypeScript frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Node + Express backend serving built frontend
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/src ./src
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 3000

CMD ["node", "src/index.js"]
