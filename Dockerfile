FROM golang

RUN apt-get update && apt-get install -y \
npm \
nodejs-legacy

ADD . /go/src/github.com/Palantir/palantir

WORKDIR /go/src/github.com/Palantir/palantir
RUN npm install 
RUN npm run deploy

RUN go get -u github.com/kardianos/govendor
RUN govendor sync
RUN go install github.com/Palantir/palantir 

ENTRYPOINT /go/bin/palantir
EXPOSE 3001
