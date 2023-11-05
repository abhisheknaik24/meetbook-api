FROM node:latest

WORKDIR /app

COPY package*.json /app

COPY . /app

COPY .env /app

ENV NODE_ENV=production

RUN npm install

RUN npm run postinstall

RUN npm run postgenerate

RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]
