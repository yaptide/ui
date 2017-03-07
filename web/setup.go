package web

import (
	"github.com/Palantir/palantir/config"
	"github.com/Palantir/palantir/model/simulation/setup/converter/shield"
	"gopkg.in/mgo.v2"
)

// ServerContext context passed to all subrouters
type ServerContext struct {
	DbSession mgo.Session

	Parser     shield.Parser // TODO move utils to another package
	Serializer shield.Serializer
}

func setupServerContext(conf *config.Config) *ServerContext {
	return &ServerContext{}
}
