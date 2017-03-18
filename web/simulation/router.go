package simulation

import (
	"github.com/gorilla/mux"

	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/simulation/setup"
)

// HandleSimulation define auth routes
func HandleSimulation(router *mux.Router, context *server.Context) {
	setup.HandleSetup(router, context)
}
