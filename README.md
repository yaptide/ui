[![Build Status](https://travis-ci.com/wkozyra95/palantir.svg?token=sCgDnvoX1GsuviUYexgT&branch=develop)](https://travis-ci.com/wkozyra95/palantir)
# Palantir

### Current instances
#### PL-Grid
<http://149.156.11.4:10206> - master  
<http://149.156.11.4:10207> - develop  
<http://149.156.11.4:10208> - staging  

### Project structure
main.go - backend entry point  
web - definition of rest endpoints  
processor - responsible for supervising parsing and simulation  
converter  
converter/serializer - serialize setup model into specyfic for library configuration files  
converter/parser - parse configuration fies to Palantir internal model  
runner - start and supervise simulations  
db - interface with db  
model - data model  
model/auth - account and auth data model  
model/project - project and version data model  
model/simulation/setup - simulation setup model  
model/simulation/results - simulation resuls model  
model/simulation/settings - settings defined for specyfic project version  
config - applications configuration  
client - frontend sources  
client/src/main.js - entry point for frontend  
client/src/api - api config  
client/src/components - reusable components  
client/src/i18n - translations dictionary  
client/src/pages - static pages
client/src/model - flow definitions for frontend data model
client/src/routes - routes definitions and content(main part of client side)  
client/src/store - configuration of data model and logic of frontend  
client/src/styles - global style used in application  
client/config - webpack and karma configuration
client/lib - 3rd party libararies
client/assets - static assets
build_tools - scripts used to build or setup environment  

### Setup development environment
#### Backend dependencies
- install go and setup GOPATH (https://golang.org/doc/install)
- setup docker without root required
- install gometalinter and available linters  
    `go get -u github.com/alecthomas/gometalinter` -install metalinter  
    `gometalinter --install`  - install all linters  
- install govendor (`go get -u github.com/kardianos/govendor`)
- install gin (`go get github.com/codegangsta/gin`)  

#### Frontend dependencies
- install node + npm ( recommended current LTS version )  

#### Build project
- clone repository inside `$GOPATH/src/github.com/Palantir/palantir` directory
- `govendor sync`
- `npm install`
- `npm start / npm run deploy`  
`npm run deploy` - generate static content  
`npm start` - start frontend as dev server  
- `go install`
- `palantir`  

Most comands listed above are included in script run.sh (checkout source)  


### Tools overview
- gometalinter  
Gometalinter checks source code for inconsistent code style, potential bugs, unhandled situations  
- govendor   
Govendor allow to define consistent versions of dependencies   
`govendor sync` will download defined dependencies  
- gin  
gin is a simple command line utility for live-reloading Go web applications.  
- npm  
package manager  

### Scripts overview
- run.sh
  - server:check client:check check - this commands run linters, checkers and tests
  - client:deploy - compile frontend sources to static content ( static/ directory)
  - client:run - run webpack-dev-server, frontend is served on port :3002, on every change code is reloaded
  - server:run - run backend, start db on port :3005
  - server:run:dev - run backend with code reloading, start db on port :3005
  - docker:run - build entire project inside docker container(with db in separate container TODO )
  - prod:run - build entire project(production version)
  - setup:go - get all dependecies used tools (require go + node)
- build_tools/release.sh  
release.sh build entire project localy an copy all files to release/ directory. 
  - release_run.sh - script after release will be named run.sh and used to start application server.
  - release_install.sh - script will install application (setup mongo on production TODO )
- build_tools/test_release.sh  - script will build release version using release.sh and run it in docker container
- build_tools/db_tools.sh - create/start db if it don't exists or it's stopped (contain only function sourced in other scripts)

### Useful commands

`docker stop $(docker ps -a -q) && docker rm $(docker ps -a -q)` - stop and remove all docker container(for cleanup)  
`govendor add +external` - add missing deps to vendor.json  
`govendor sync` - get dependecies from vendor.json  
