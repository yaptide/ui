#!/usr/bin/env bash

# This scrips start release version of application

# get script parent directory absolute path
# http://www.ostricher.com/2014/10/the-right-way-to-get-the-directory-of-a-bash-script/
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# make relative paths independent from caller working directory
cd $SCRIPT_PATH && ./bin/palantir
