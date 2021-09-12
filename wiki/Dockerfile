FROM node:14-alpine
#FROM node

WORKDIR /usr/src/app

COPY wiki.js Dockerfile package-lock.json package.json ./

RUN npm install axios --save && npm install request-promise --save

EXPOSE 3005
CMD ["node", "wiki.js"]
