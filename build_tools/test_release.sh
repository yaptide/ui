#!/bin/bash
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

$SCRIPT_PATH/release.sh

if [ "$1" = "docker" ]; then
	docker build --force-rm --tag palantir_release  --file $SCRIPT_PATH/release_test_dockerfile $SCRIPT_PATH/..
	docker run --tty --interactive --rm -p 3001:3001 --name=palantir palantir_release:latest
fi
