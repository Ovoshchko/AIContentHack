# Build stage
FROM node:24.0-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . ./

# Make sure Tailwind CSS is set up correctly
RUN npm install --save-dev tailwindcss postcss autoprefixer

# Build the app
RUN npm run build

# Production stage
FROM nginx:1.28-alpine

# Copy built files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
