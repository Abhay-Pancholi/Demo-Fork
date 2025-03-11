# Build stage
FROM node:18 AS build
WORKDIR /app

# Copy package files and install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy the source code
COPY frontend/. .

# Build the React app
ENV NODE_OPTIONS="--openssl-legacy-provider"
RUN npm run build

# Serve with Nginx
FROM nginx:alpine
# Copy custom Nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
