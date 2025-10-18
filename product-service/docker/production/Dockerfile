# Using Lightweight docker image for node
FROM node:22-alpine

# Setting Up Working Directory
WORKDIR /app

# Copying Package Files
COPY package*.json .

# Installing Dependencies
RUN npm ci --omit=dev

# Copying Files
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Exposing Port
EXPOSE 3001

# Start Application
CMD ["npm", "run", "start"]