FROM node:8 AS frontend_build

COPY . /root/app
RUN cd /root/app && \
  rm -rf node_modules && \
  npm install && \
  npm run deploy

RUN mv /root/app/static /build

FROM debian:9

RUN DEBIAN_FRONTEND=noninteractive apt-get -y update && \
  DEBIAN_FRONTEND=noninteractive apt-get -y install nginx

COPY --from=frontend_build /build /root/frontend
COPY ./config/docker.nginx.conf /etc/nginx/nginx.conf
COPY ./config/docker.run.sh /root/run.sh

ENTRYPOINT bash root/run.sh /root/frontend

