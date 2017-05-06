package setup

import (
	"fmt"
	"net/http"

	"github.com/Palantir/palantir/web/pathvars"
	"github.com/Palantir/palantir/web/server"
	"github.com/gorilla/mux"
)

// HandleSetup define simulation setup routes
func HandleSetup(router *mux.Router, context *server.Context) {
	middlewares := context.ValidationMiddleware

	setupIDRoute := fmt.Sprintf("/{%s}", pathvars.SetupID)
	router.Handle(setupIDRoute, middlewares(&getSetupHandler{context})).Methods(http.MethodGet)
	router.Handle(setupIDRoute, middlewares(&updateSetupHandler{context})).Methods(http.MethodPut)
}
