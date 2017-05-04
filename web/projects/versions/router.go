// Package versions implement /projects/{projectId}/versions routes.
package versions

import (
	"fmt"
	"net/http"

	"github.com/Palantir/palantir/web/projects/pathvars"
	"github.com/Palantir/palantir/web/server"
	"github.com/gorilla/mux"
)

// HandleVersions define versions routes.
func HandleVersions(router *mux.Router, context *server.Context) {
	middlewares := context.ValidationMiddleware

	router.Handle("", middlewares(&createVersionHandler{context})).Methods(http.MethodPost)

	versionIDRoute := fmt.Sprintf("/create/from/{%s}", pathvars.VersionID)
	router.Handle(versionIDRoute,
		middlewares(&createFromExistingVersionHandler{context})).
		Methods(http.MethodPost)
}
