#!/usr/bin/env bash

# get script parent directory absolute path
# http://www.ostricher.com/2014/10/the-right-way-to-get-the-directory-of-a-bash-script/
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HOST=debian@149.156.11.4
HOST_PORT=10202
SSH_IDENTITY=/home/travis/.ssh/deploy_key

current_branch="$TRAVIS_BRANCH"

if [ "master" = $current_branch ]; then
    echo "{\"port\": \"5001\", \"dbName\": \"palantir-db-master\", \"dbUsername\": \"master\", \"dbPassword\": \"password\", \"dbPort\": \"27017\"}" > $SCRIPT_PATH/../release/conf.json
    ssh -v -o "StrictHostKeyChecking no" $HOST -p $HOST_PORT -i $SSH_IDENTITY "mkdir -p ~/deploy && rm -rf ~/deploy/master" 
    scp -v -o "StrictHostKeyChecking no" -P $HOST_PORT -i $SSH_IDENTITY -r $SCRIPT_PATH/../release $HOST:~/deploy/master
    ssh -v -o "StrictHostKeyChecking no" $HOST -p $HOST_PORT -i $SSH_IDENTITY "~/start.sh \"master\" > foo.out 2> foo.err < /dev/null &" 
elif [ "develop" = "$current_branch" ]; then
    echo "{\"port\": \"5002\", \"dbName\": \"palantir-db-develop\", \"dbUsername\": \"develop\", \"dbPassword\": \"password\", \"dbPort\": \"27017\"}" > $SCRIPT_PATH/../release/conf.json
    ssh -v -o "StrictHostKeyChecking no" $HOST -p $HOST_PORT -i $SSH_IDENTITY "mkdir -p ~/deploy && rm -rf ~/deploy/develop" 
    scp -v -o "StrictHostKeyChecking no" -P $HOST_PORT -i $SSH_IDENTITY -r $SCRIPT_PATH/../release $HOST:~/deploy/develop
    ssh -v -o "StrictHostKeyChecking no" $HOST -p $HOST_PORT -i $SSH_IDENTITY "~/start.sh \"develop\" > foo.out 2> foo.err < /dev/null &" 
elif [ "false" = "$TRAVIS_PULL_REQUEST" ]; then
    echo "{\"port\": \"5003\", \"dbName\": \"palantir-db-staging\", \"dbUsername\": \"staging\", \"dbPassword\": \"password\", \"dbPort\": \"27017\"}" > $SCRIPT_PATH/../release/conf.json
    ssh -v -o "StrictHostKeyChecking no" $HOST -p $HOST_PORT -i $SSH_IDENTITY "mkdir -p ~/deploy && rm -rf ~/deploy/${current_branch:0:3}" 
    scp -v -o "StrictHostKeyChecking no" -P $HOST_PORT -i $SSH_IDENTITY -r $SCRIPT_PATH/../release $HOST:~/deploy/${current_branch:0:3}
else
    echo "{\"port\": \"5003\", \"dbName\": \"palantir-db-staging\", \"dbUsername\": \"staging\", \"dbPassword\": \"password\", \"dbPort\": \"27017\"}" > $SCRIPT_PATH/../release/conf.json
    ssh -v -o "StrictHostKeyChecking no" $HOST -p $HOST_PORT -i $SSH_IDENTITY "mkdir -p ~/deploy && rm -rf ~/deploy/${TRAVIS_PULL_REQUEST:0:3}pr" 
    scp -v -o "StrictHostKeyChecking no" -P $HOST_PORT -i $SSH_IDENTITY -r $SCRIPT_PATH/../release $HOST:~/deploy/${TRAVIS_PULL_REQUEST:0:3}pr
fi

echo "$current_branch"
