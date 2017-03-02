package list

import (
	"github.com/gorilla/mux"
	"net/http"
)

// HandleProjectList define project list routes
func HandleProjectList(router *mux.Router) {
	router.Handle("/list", &getProjectList{}).Methods(http.MethodGet)
}
