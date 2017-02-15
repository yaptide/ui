#!/usr/bin/env bash

# get script parent directory absolute path
# http://www.ostricher.com/2014/10/the-right-way-to-get-the-directory-of-a-bash-script/
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
RELEASE_ROOT=$SCRIPT_PATH/../release

# stop on first error
set -e

# prepare release build
$SCRIPT_PATH/release.sh

if [ "$1" = "docker" ]; then
    # replace runtime config
    echo "{\"Port\": 3201, \"StaticDirectory\": \"./dist\"}" > $RELEASE_ROOT/conf.json
    
    # copy Dockerfile to preserve context
    cp release_test_dockerfile $RELEASE_ROOT/Dockerfile

	docker build --force-rm --tag palantir_release $RELEASE_ROOT 
	docker run --tty --interactive --rm -p 3201:3201 --name=palantir palantir_release:latest
fi
