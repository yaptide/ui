package api

import (
	"github.com/Palantir/palantir/config"
	"github.com/Palantir/palantir/db"
	"gopkg.in/mgo.v2"
)

// ServerContext context passed to all subrouters
type ServerContext struct {
	DbSession mgo.Session
}

func setupServerContext(conf *config.Config) *ServerContext {
	db.SetupDbConnection(conf)
	return &ServerContext{}
}
