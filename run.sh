#!/usr/bin/env bash

# get script parent directory absolute path
# http://www.ostricher.com/2014/10/the-right-way-to-get-the-directory-of-a-bash-script/
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source $SCRIPT_PATH/build_tools/db_tools.sh

set -e

if [ "$1" = "client:check" ]; then
    cd $SCRIPT_PATH
    npm run check
elif [ "$1" = "client:deploy" ]; then
    cd $SCRIPT_PATH
    rm -rf $SCRIPT_PATH/dist
    npm install
    npm run deploy
elif [ "$1" = "client:run" ]; then
    cd $SCRIPT_PATH
    npm install
    npm start
elif [ "$1" = "server:run" ]; then
    cd $SCRIPT_PATH
    echo "{\"Port\": 3001, \"StaticDirectory\": \"./dist\"}" > $SCRIPT_PATH/conf.json
    startDB "dev" "3005"
    govendor sync
    go run main.go
elif [ "$1" = "server:run:dev" ]; then
    # go get github.com/codegangsta/gin
    echo "{\"Port\": 3001, \"StaticDirectory\": \"./dist\"}" > $SCRIPT_PATH/conf.json
    cd $SCRIPT_PATH
    startDB "dev"
    gin
elif [ "$1" = "server:check" ]; then
    # go get -u github.com/alecthomas/gometalinter
    # gometalinter --install
    # /... - checking recursively all files inside
    cd $SCRIPT_PATH
    gometalinter --config=.gometalinter.json --deadline 200s ./...
elif [ "$1" = "check" ]; then
    cd $SCRIPT_PATH
    gometalinter --config=.gometalinter.json --deadline 200s ./...
    npm run check
elif [ "$1" = "docker:run" ]; then
    cd $SCRIPT_PATH
    echo "{\"Port\": 3301, \"StaticDirectory\": \"./dist\"}" > $SCRIPT_PATH/conf.json
    protoc --go_out=./ **/*.proto
    docker build --force-rm --tag palantir $SCRIPT_PATH
    docker run --tty --interactive --rm -p 3301:3301 --name=palantir palantir:latest
elif [ "$1" = "prod:run" ]; then
    echo "{\"Port\": 3101, \"StaticDirectory\": \"./dist\"}" > $SCRIPT_PATH/conf.json
    cd $SCRIPT_PATH
    startDB "prod"
    ./run.sh client:deploy

    # protoc --go_out=./ **/*.proto   - ** won't work inside script (use find instead)
    find .  -iname "*.proto" -exec protoc --go_out=./ {}  \;

    go install -v
    palantir 
elif [ "$1" = "setup:go" ]; then
    # I assume that go and protoc are installed and GOPATH is set
    cd $SCRIPT_PATH
    go get -u github.com/alecthomas/gometalinter
    gometalinter --install
    go get -u github.com/kardianos/govendor
    go get  github.com/codegangsta/gin
    go get -u github.com/golang/protobuf/{proto,protoc-gen-go}

    # protoc --go_out=./ **/*.proto   - ** won't work inside script (use find instead)
    find .  -iname "*.proto" -exec protoc --go_out=./ {}  \;

    npm install
else
    echo "
    client:check - run all checks lint+flow+test
    client:deploy - generate static client code
    client:run - run client dev server
    server:run - run server
    server:run:dev - run server with hot reloading - TODO
    server:check - run linters and tests on backend
    check - server:check + client:check
    docker:run - build & run new docker container
    prod:run - run production version localy
    setup:go - get all tools required in dev environment
    "
fi

