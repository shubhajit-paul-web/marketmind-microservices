# Using Lightweight docker image for node
FROM node:22-alpine

# Setting Up Working Directory
WORKDIR /app

# Copying Package Files
COPY package*.json .

# Installing Dependencies
RUN npm ci

# Copying Files
COPY . .

# Set environment to development
ENV NODE_ENV=development

# Exposing Port
EXPOSE 3001

# Start Application
CMD ["npm", "run", "dev"]