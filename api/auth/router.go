package auth

import (
	"github.com/gorilla/mux"
	"net/http"
)

// HandleAuth define auth routes
func HandleAuth(router *mux.Router) {
	router.Handle("/login", &loginHandler{}).Methods(http.MethodPost)
	router.Handle("/register", &mockLoginHandler{}).Methods(http.MethodGet)
	router.Handle("/account", &mockLoginHandler{}).Methods(http.MethodGet)
}
