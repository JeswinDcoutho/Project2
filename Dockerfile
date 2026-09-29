FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY server.js ./

ARG APP_VERSION=1.0
ENV APP_VERSION=${APP_VERSION}

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
