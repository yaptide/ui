package setup

import (
	"net/http"

	"github.com/gorilla/mux"
)

// HandleSetup define simulation setup routes
func HandleSetup(router *mux.Router) {
	router.Handle("/{simulationId}/setup", &getSetup{}).Methods(http.MethodGet)
}
