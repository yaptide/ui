// Package id implement /projects/{projectId} routes.
package id

import (
	"fmt"
	"net/http"

	"github.com/Palantir/palantir/web/server"
	"github.com/gorilla/mux"
)

const projectIDRouteVar = "projectID"

// HandleProjectID define project element routes.
func HandleProjectID(router *mux.Router, context *server.Context) {
	middlewares := context.ValidationMiddleware
	route := fmt.Sprintf("/{%s}", projectIDRouteVar)

	router.Handle(route, middlewares(&updateProjectHandler{context})).Methods(http.MethodPut)
	router.Handle(route, middlewares(&deleteProjectHandler{context})).Methods(http.MethodDelete)
}
