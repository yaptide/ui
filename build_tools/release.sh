#!/bin/bash

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."

$PROJECT_ROOT/run.sh client:deploy \
&& rm -rf $PROJECT_ROOT/release \
&& mkdir -p $PROJECT_ROOT/release \
&& cp -R $PROJECT_ROOT/dist $PROJECT_ROOT/release/dist \
&& cd $PROJECT_ROOT && go install -v \
&& cp `which palantir` $PROJECT_ROOT/release/ \
&& cp $PROJECT_ROOT/build_tools/release_run.sh $PROJECT_ROOT/release/run.sh \
&& cp $PROJECT_ROOT/build_tools/release_conf.json $PROJECT_ROOT/release/conf.json \
&& cp $PROJECT_ROOT/build_tools/release_install.sh $PROJECT_ROOT/release/install.sh
