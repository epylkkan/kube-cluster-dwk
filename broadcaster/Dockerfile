FROM node:14-alpine

WORKDIR /usr/src/app

COPY /package* ./
RUN npm install
RUN npm install express --save && npm install cors --save && npm install pg --save && npm install nats --save 
RUN npm install telegraf --save && npm install os --save 

COPY . .

CMD ["node", "index.js"]
