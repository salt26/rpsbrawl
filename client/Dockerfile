FROM node:18

ARG DEFAULT_RPS_USERNAME="hello" \
    DEFAULT_RPS_PASSWORD="changethis" \
    DEFAULT_RPS_BASE_SERVER_URL="http://localhost:8000" \
    DEFAULT_RPS_BASE_WEBSOCKET_URL="ws://localhost:8000"

WORKDIR /client

COPY package.json /client/package.json
RUN npm install --force

COPY . /client
RUN npm run build

RUN npm install -g serve

ENV REACT_APP_RPS_USERNAME=$DEFAULT_RPS_USERNAME \
    REACT_APP_RPS_PASSWORD=$DEFAULT_RPS_PASSWORD \
    REACT_APP_RPS_BASE_SERVER_URL=$DEFAULT_RPS_BASE_SERVER_URL \
    REACT_APP_RPS_BASE_WEBSOCKET_URL=$DEFAULT_RPS_BASE_WEBSOCKET_URL

COPY /build /client/build

CMD ["serve", "-l", "3000", "-s", "build"]
