FROM node:18-alpine

WORKDIR /usr/src/app

# Kopiuję je osobno, aby wykorzystać cache'owanie warstw Dockera
COPY package*.json ./

RUN npm install --only=production

COPY . .

CMD [ "node", "index.js" ]