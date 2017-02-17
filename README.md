[![Build Status](https://travis-ci.com/wkozyra95/palantir.svg?token=sCgDnvoX1GsuviUYexgT&branch=develop)](https://travis-ci.com/wkozyra95/palantir)
# Palantir

### Setup development environment
#### Backend dependicies
- install go and setup GOPATH (https://golang.org/doc/install)
- install protoc compiler (https://github.com/google/protobuf)
- install gometalinter and available linters  
    `go get -u github.com/alecthomas/gometalinter` -install metalinter  
    `gometalinter --install`  - install all linters  
- install govendor (`go get -u github.com/kardianos/govendor`)
- install gin (`go get github.com/codegangsta/gin`)  

#### Frontend dependicies  
- install node + npm ( recomended current LTS version )  

#### Build project
- clone repository inisde `$GOPATH/src/github.com/Palantir/palantir` directory
- `govendor sync`
- `npm install`
- `npm start / npm run deploy`  
`npm run deploy` - generate static content  
`npm start` - start frontend as dev server  
- `go install`
- `palantir`  

Most comands listed above are included in script run.sh (checkout source)  


### Tools overview
- protoc compiler  
generate source code described by *.proto files   
 `protoc --go_out=./ **/*.proto` - generate go sources for etire project    
- gometalinter  
Gometalinter cheks source code for inconsistent code style, potential bugs, unhandled situations  
- govendor   
Govendor allow to define consistent versions of dependicies   
`govendor sync` will download defined dependicies  
- gin  
gin is a simple command line utility for live-reloading Go web applications.  
- npm  
package manager  

