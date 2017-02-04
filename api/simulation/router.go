package simulation

import (
	"github.com/gorilla/mux"

	"github.com/wkozyra95/palantir/api/simulation/setup"
	//"github.com/wkozyra95/palantir/api/simulation/results"
	//"github.com/wkozyra95/palantir/api/simulation/status"
)

// HandleSimulation define auth routes
func HandleSimulation(router *mux.Router) {
	setup.HandleSetup(router)
}
