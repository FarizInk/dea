FROM node:latest

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install packages
RUN npm install

# Copy the app code
COPY bot/ ./bot/
COPY .env .
COPY tsconfig.json .

# Build the project
RUN npm run build-bot

# Run the application
CMD [ "node", "dist-bot/index.js" ]