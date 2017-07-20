// Package result implement
// /projects/{projectId}/versions{versionID}/simulation/result routes.
package result

import (
	"net/http"

	"github.com/Palantir/palantir/web/server"
	"github.com/gorilla/mux"
)

// HandleResult define simulation result routes.
func HandleResult(router *mux.Router, context *server.Context) {
	middlewares := context.ValidationMiddleware

	//router.Handle(setupIDRoute+"/progress", middlewares(&getProgressSetupHandler{context})).
	//	Methods(http.MethodGet)

	router.Handle("", middlewares(&getResultHandler{context})).Methods(http.MethodGet)
}
