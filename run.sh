#!/bin/bash
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

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
    npm run deploy
elif [ "$1" = "client:run" ]; then
    cd $SCRIPT_PATH
    npm start
elif [ "$1" = "server:run" ]; then
    go run main.go
elif [ "$1" = "server:run:dev" ]; then
    gin
elif [ "$1" = "server:check" ]; then
    gometalinter
elif [ "$1" = "check" ]; then
    gometalinter --config=.gometalinter.json --deadline 200s ./... && cd $SCRIPT_PATH/client && npm run check
elif [ "$1" = "docker:build" ]; then
	docker build --force-rm -t palantir .
elif [ "$1" = "docker:run" ]; then
	docker run --tty --interactive --rm -p 3001:3001 --name=palantir palantir:latest
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
        docker:build- build docker image
        docker:run- run new docker container
        local:deploy:prod - TODO
        local:deploy:dev - TODO"
        

        # protoc - protoc --go_out=./ **/*.proto
fi

