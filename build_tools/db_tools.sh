#!/usr/bin/env bash

function startDB {
    set +e
    DB_NAME=palantir-db-$1
    IS_RUNNING=`docker inspect -f {{.State.Running}} palantir-db-$1 > /dev/null 2>&1`
    docker inspect palantir-db-${1} > /dev/null 2>&1
    EXISTS=$?
    
    set -e
    if [ "$IS_RUNNING" != "true" ] && [ "$EXISTS" = "0" ]; then
        echo "Start mongo docker"
        docker start $DB_NAME
    elif [ "$EXISTS" != "0" ] ; then
        # temporary container without auth
        docker run -p $2:27017 --name $DB_NAME -d mongo --auth
        sleep 3 # db need some time to initialize
        # create user
        docker exec $DB_NAME mongo admin --eval "db.createUser({ user: \"root\", pwd: \"password\", roles: [ { role: \"root\", db: \"admin\" } ] });" 

        docker exec $DB_NAME mongo admin -u root -p password \
            --eval "db.getSiblingDB(\"$DB_NAME\").createUser({ user: \"$DB_NAME\", pwd: \"password\", roles: [ { role: \"readWrite\", db: \"$DB_NAME\" }] });" 

        echo "User and db $DB_NAME created (port: $2)."
    fi
}

