FROM node:18

WORKDIR /client

ARG DEFAULT_RPS_PASSWORD=changethis

ENV REACT_APP_RPS_USERNAME=rpsbro \
    REACT_APP_RPS_PASSWORD=$DEFAULT_RPS_PASSWORD \
    REACT_APP_RPS_BASE_SERVER_URL=https://rpsdata.dantae.net \
    REACT_APP_RPS_BASE_WEBSOCKET_URL=wss://rpsdata.dantae.net

COPY package.json /client/package.json
RUN npm install --force

COPY . /client
COPY .env /client/.env
RUN npm run build

RUN npm install -g serve

COPY /build /client/build

CMD ["serve", "-l", "3000", "-s", "build"]
