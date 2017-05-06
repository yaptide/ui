// Package simulation implement /simulation routes.
package simulation

import (
	"github.com/gorilla/mux"

	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/simulation/setup"
)

// HandleSimulation define simulation routes.
func HandleSimulation(router *mux.Router, context *server.Context) {
	setupRouter := router.PathPrefix("/setup").Subrouter()
	setup.HandleSetup(setupRouter, context)
}
