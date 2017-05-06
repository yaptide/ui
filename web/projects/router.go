// Package projects implement /projects routes.
package projects

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/Palantir/palantir/web/pathvars"
	"github.com/Palantir/palantir/web/projects/versions"
	"github.com/Palantir/palantir/web/server"
)

// HandleProject define project routes.
func HandleProject(router *mux.Router, context *server.Context) {
	middlewares := context.ValidationMiddleware

	router.Handle("", middlewares(&getProjectsHandler{context})).Methods(http.MethodGet)
	router.Handle("", middlewares(&createProjectHandler{context})).Methods(http.MethodPost)

	projectIDRoute := fmt.Sprintf("/{%s}", pathvars.ProjectID)
	idRouter := router.PathPrefix(projectIDRoute).Subrouter()

	idRouter.Handle("", middlewares(&updateProjectHandler{context})).Methods(http.MethodPut)
	idRouter.Handle("", middlewares(&deleteProjectHandler{context})).Methods(http.MethodDelete)

	versionsRouter := idRouter.PathPrefix("/versions").Subrouter()
	versions.HandleVersions(versionsRouter, context)
}
