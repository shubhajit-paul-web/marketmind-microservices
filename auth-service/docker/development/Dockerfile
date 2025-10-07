# Using Lightweight docker image for node
FROM node:22-alpine

# Setting Up Working Directory
WORKDIR /app

# Copying Package Files
COPY package*.json ./

# Installing Dependencies
RUN npm ci

# Copying Files
COPY . .

# Exposing Port
EXPOSE 3000

# Start Application
CMD ["npm", "run", "dev"]