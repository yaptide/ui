#!/usr/bin/env bash

# get script parent directory absolute path
# http://www.ostricher.com/2014/10/the-right-way-to-get-the-directory-of-a-bash-script/
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -e

if [ "$1" = "client:lint" ]; then
    cd $SCRIPT_PATH
    npm run lint
elif [ "$1" = "client:lint:fix" ]; then
    cd $SCRIPT_PATH
    npm run lint:fix
elif [ "$1" = "client:flow" ]; then
    cd $SCRIPT_PATH
    npm run flow
elif [ "$1" = "client:test" ]; then
    cd $SCRIPT_PATH
    npm run test
elif [ "$1" = "client:check" ]; then
    cd $SCRIPT_PATH
    npm run check
elif [ "$1" = "client:deploy" ]; then
    cd $SCRIPT_PATH
    rm -rf $SCRIPT_PATH/dist
    npm run deploy
elif [ "$1" = "client:run" ]; then
    cd $SCRIPT_PATH
    npm start
elif [ "$1" = "server:run" ]; then
    cd $SCRIPT_PATH
    go run main.go
elif [ "$1" = "server:run:dev" ]; then
    # go get github.com/codegangsta/gin
    cd $SCRIPT_PATH
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
    cd $SCRIPT_PATH/client
    npm run check
elif [ "$1" = "docker:run" ]; then
    echo "{\"Port\": 3301, \"StaticDirectory\": \"./dist\"}" > $SCRIPT_PATH/conf.json
	docker build --force-rm --tag palantir $SCRIPT_PATH
	docker run --tty --interactive --rm -p 3301:3301 --name=palantir palantir:latest
elif [ "$1" = "prod:run" ]; then
    echo "{\"Port\": 3101, \"StaticDirectory\": \"./dist\"}" > $SCRIPT_PATH/conf.json
    $SCRIPT_PATH/run.sh client:deploy
    cd $SCRIPT_PATH
    # protoc - protoc --go_out=./ **/*.proto
    go install -v
    palantir 
else
    echo "
        client:lint - check code with linter
        client:lint:fix - check code with linter and fix if possible
        client:flow - static type check
        client:test - run tests on frontend
        client:check - run all checks lint+flow+test
        client:deploy - generate static client code
        client:run - run client dev server
        server:run - run server
        server:run:dev - run server with hot reloading - TODO
        docker:run - build & run new docker container
        local:prod - run production version localy"
        

fi

