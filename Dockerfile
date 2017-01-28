FROM golang

RUN apt-get update && apt-get install -y npm
ADD ./server /go/src/palantir
ADD ./client /palantir

RUN cd /palantir && npm install && npm build
RUN go install palantir

ENTRYPOINT /go/bin/palantir
EXPOSE 3001
