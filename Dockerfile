FROM node:18-alpine
WORKDIR /usr/src/api_front
COPY package.json ./
COPY yarn.lock ./
COPY . .
EXPOSE 3333
ENV WAIT_VERSION 2.9.0
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait