package simulation

import (
	"github.com/gorilla/mux"

	"github.com/Palantir/palantir/api/simulation/setup"
	//"github.com/Palantir/palantir/api/simulation/results"
	//"github.com/Palantir/palantir/api/simulation/status"
)

// HandleSimulation define auth routes
func HandleSimulation(router *mux.Router) {
	setup.HandleSetup(router)
}
