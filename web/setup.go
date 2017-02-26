package web

import (
	"github.com/Palantir/palantir/config"
	"gopkg.in/mgo.v2"
)

// ServerContext context passed to all subrouters
type ServerContext struct {
	DbSession mgo.Session
}

func setupServerContext(conf *config.Config) *ServerContext {
	return &ServerContext{}
}
