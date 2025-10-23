# Etapa de build con Vite
FROM node:20-alpine AS build
WORKDIR /app

# Copiar dependencias y hacer install
COPY package*.json ./
RUN npm install

# Copiar todo el código y hacer build con Vite
COPY . .
RUN npm run build

# Etapa final para servir con Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Opcional: elimina archivos default de Nginx y copia tu configuración si tienes una
# COPY nginx.conf /etc/nginx/nginx.conf
#COPY ../nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
