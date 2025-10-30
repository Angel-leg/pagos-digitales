# Dockerfile
FROM node:18-alpine

# Instalar netcat (nc)
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copiar primero los archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código, incluido el script
COPY . .

# Dar permisos de ejecución al script
RUN chmod +x /app/wait-for-it.sh

EXPOSE 3001

# Esperar a MySQL antes de iniciar
ENTRYPOINT []
CMD ["sh", "-c", "cd /app && exec ./wait-for-it.sh mysql:3306 -- npm start"]
