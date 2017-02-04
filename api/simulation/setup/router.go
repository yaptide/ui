package setup

import (
	"github.com/gorilla/mux"
	"net/http"
)

// HandleSetup define simulation setup routes
func HandleSetup(router *mux.Router) {
	router.Handle("/{simulationId}/setup", &getSetup{}).Methods(http.MethodGet)
}
