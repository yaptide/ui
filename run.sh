#!/bin/bash
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ "$1" = "client:lint" ]; then
    cd $SCRIPT_PATH/client
    npm run lint
elif [ "$1" = "client:lint:fix" ]; then
    cd $SCRIPT_PATH/client
    npm run lint:fix
elif [ "$1" = "client:flow" ]; then
    cd $SCRIPT_PATH/client
    npm run flow
elif [ "$1" = "client:test" ]; then
    cd $SCRIPT_PATH/client
    npm run test
elif [ "$1" = "client:check" ]; then
    cd $SCRIPT_PATH/client
    npm run check
elif [ "$1" = "client:deploy" ]; then
    cd $SCRIPT_PATH/client
    npm run deploy
elif [ "$1" = "client:run" ]; then
    cd $SCRIPT_PATH/client
    npm start
elif [ "$1" = "server:run" ]; then
    go run main.go
elif [ "$1" = "server:run:dev" ]; then
    gin
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
        docker:deploy:prod - TODO
        docker:deploy:dev - TODO
        local:deploy:prod - TODO
        local:deploy:dev - TODO"
        

        # protoc - protoc --go_out=./ **/*.proto
fi

