FROM node:14-alpine

WORKDIR /usr/src/app

COPY front.js Dockerfile package-lock.json package.json ./
COPY views ./views
COPY public ./public

RUN npm install axios --save && npm install fs --save && npm install request --save && \
    npm install ejs --save && npm install tcp-ping --save && npm install express --save 


EXPOSE 3000
CMD ["node", "front.js"]
