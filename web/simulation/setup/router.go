package setup

import (
	"net/http"

	"github.com/Palantir/palantir/web/server"
	"github.com/gorilla/mux"
)

// HandleSetup define simulation setup routes
func HandleSetup(router *mux.Router, context *server.Context) {
	router.Handle("/{simulationId}/setup", &getSetupHandler{context}).Methods(http.MethodGet)
}
