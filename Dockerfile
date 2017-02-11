FROM golang

# nodejs-legacy pkg create "ln -s `which nodejs` /usr/bin/node", this is required for npm in Debian
RUN apt-get update && apt-get install --no-install-recommends -y \
npm \
nodejs-legacy \
&& rm -rf /var/lib/apt/lists/*

ADD . /go/src/github.com/Palantir/palantir

WORKDIR /go/src/github.com/Palantir/palantir
RUN npm install 
RUN npm run deploy

RUN go get -u github.com/kardianos/govendor
RUN govendor sync
RUN go install github.com/Palantir/palantir 

ENTRYPOINT /go/bin/palantir
EXPOSE 3001
