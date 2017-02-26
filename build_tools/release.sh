#!/usr/bin/env bash

# get script parent directory absolute path
# http://www.ostricher.com/2014/10/the-right-way-to-get-the-directory-of-a-bash-script/
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT=$SCRIPT_PATH/..

# script will exit with error when one of comands fail
set -e

# clean
rm -rf $PROJECT_ROOT/release
mkdir $PROJECT_ROOT/release
mkdir $PROJECT_ROOT/release/bin

# frontend deploy
$PROJECT_ROOT/run.sh client:deploy
cp -R $PROJECT_ROOT/static $PROJECT_ROOT/release/static

# backend deploy
cd $PROJECT_ROOT && go install -v
cp `which palantir` $PROJECT_ROOT/release/bin

# copy runtime tools
cp $PROJECT_ROOT/build_tools/release_run.sh $PROJECT_ROOT/release/run.sh
cp $PROJECT_ROOT/build_tools/release_conf.json $PROJECT_ROOT/release/conf.json
cp $PROJECT_ROOT/build_tools/release_install.sh $PROJECT_ROOT/release/install.sh
