FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache openssl

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Generar Prisma Client
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Build (solo en producción)
# RUN npm run build

EXPOSE 3001

# Comando por defecto (puede ser sobrescrito por docker-compose)
CMD ["npm", "run", "dev"]
