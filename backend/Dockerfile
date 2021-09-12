FROM node:14-alpine
#FROM node

WORKDIR /usr/src/app

COPY server.js Dockerfile package-lock.json package.json ./
COPY public ./public

#RUN apk update && apk install sqlite3
RUN npm install express --save && npm install cors --save && npm install pg --save && npm install nats --save

EXPOSE 3002
CMD ["node", "server.js"]
