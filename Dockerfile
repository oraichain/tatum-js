# Use the Node.js image with Alpine for a smaller footprint
FROM node:22-alpine3.19

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock first to install dependencies
COPY package.json yarn.lock ./

COPY .yarnrc.yml .yarnrc.yml

# Copy the rest of the application code
COPY ./src ./src

# Install dependencies
RUN yarn add typescript
RUN yarn add tsx
RUN yarn install

# Start the server
CMD ["yarn", "start"]

# docker build -t parser-services .
# docker run -it --name parser-services -p 9000:9000 parser-services:latest