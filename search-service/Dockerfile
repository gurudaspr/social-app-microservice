#use the node 18 as base image

FROM node:18-alpine

# Create app directory

WORKDIR /usr/src/app

# Install app dependencies

COPY package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3004

CMD [ "node", "src/server.js" ]

