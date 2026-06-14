FROM node:25-alpine

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL
ARG ORIGIN
ENV ORIGIN $ORIGIN

WORKDIR /app

COPY svelte.config.js package.json ./

RUN npm install -g npm@latest && npm install

COPY . .

RUN npm run build

CMD [ "./start.sh" ]
