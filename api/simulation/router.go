package simulation

import (
	"github.com/gorilla/mux"

	"palantir/api/simulation/setup"
	//"palantir/api/simulation/results"
	//"palantir/api/simulation/status"
)

// HandleSimulation define auth routes
func HandleSimulation(router *mux.Router) {
	setup.HandleSetup(router)
}
