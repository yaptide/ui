package project

import (
	"github.com/gorilla/mux"

	"github.com/Palantir/palantir/web/project/list"
	//"github.com/Palantir/palantir/web/simulation/results"
	//"github.com/Palantir/palantir/web/simulation/status"
)

// HandleSimulation define auth routes
func HandleSimulation(router *mux.Router) {
	list.HandleProjectList(router)
}
