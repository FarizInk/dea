## build runner
FROM node:lts-alpine AS build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json .

# Install dependencies
RUN npm install

# Move source files
COPY bot ./bot
COPY tsconfig.json  .

# Build project
RUN npm run build

## production runner
FROM node:lts-alpine AS prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json

# Install dependencies
RUN npm install --omit=dev

# Move build files
COPY cache ./cache
COPY --from=build-runner /tmp/app/build /app/build

# Start bot
CMD [ "npm", "run", "start" ]
