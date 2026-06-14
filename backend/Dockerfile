FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json backend/
RUN npm install --workspace backend
COPY backend backend
COPY supabase supabase
RUN npm --workspace backend run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY backend/package*.json backend/
RUN npm install --workspace backend --omit=dev
COPY --from=build /app/backend/dist backend/dist
EXPOSE 8080
CMD ["npm", "--workspace", "backend", "start"]
