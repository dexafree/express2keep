#FROM node:alpine
FROM alekzonder/puppeteer:latest

WORKDIR /usr/src/app

USER root

ADD https://github.com/Yelp/dumb-init/releases/download/v1.1.1/dumb-init_1.1.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
CMD ["dumb-init", "node", "main.js" ]
