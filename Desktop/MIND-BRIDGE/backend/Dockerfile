# Use Node.js 20-alpine as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install dependencies for healthcheck
RUN apk add --no-cache curl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5001

# Command to run the application
CMD ["node", "server.js"]

