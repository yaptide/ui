package list

import (
	"net/http"

	"github.com/Palantir/palantir/web/server"
	"github.com/gorilla/mux"
)

// HandleProjectList define project list routes
func HandleProjectList(router *mux.Router, context *server.Context) {
	router.Handle("/list", &getProjectListHandler{context}).Methods(http.MethodGet)
}
