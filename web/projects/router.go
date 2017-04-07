// Package projects implement /projects routes.
package projects

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/Palantir/palantir/web/projects/id"
	"github.com/Palantir/palantir/web/server"
)

// HandleProject define project routes.
func HandleProject(router *mux.Router, context *server.Context) {
	middlewares := context.ValidationMiddleware

	router.Handle("", middlewares(&getProjectsHandler{context})).Methods(http.MethodGet)
	router.Handle("", middlewares(&createProjectHandler{context})).Methods(http.MethodPost)

	id.HandleProjectID(router, context)
}
