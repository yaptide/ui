package setup

import (
	"github.com/gorilla/mux"
	"net/http"
)

func HandleSetup(router *mux.Router) {
	router.Handle("/{simulationId}/setup", &getSetup{}).Methods(http.MethodGet)
}
