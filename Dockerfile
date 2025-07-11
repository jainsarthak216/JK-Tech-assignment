FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy rest of app
COPY . .

# Build
RUN npm run build

# Expose port and start
EXPOSE 3000
CMD ["node", "dist/main"]
