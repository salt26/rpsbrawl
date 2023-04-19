FROM node:18

WORKDIR /client

COPY package.json /client/package.json
RUN npm install --force

COPY . /client
RUN npm run build

RUN npm install -g serve

COPY /build /client/build

CMD ["serve", "-s", "build"]
