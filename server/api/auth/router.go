package auth

import (
	"github.com/gorilla/mux"
)

// HandleAuth define auth routes
func HandleAuth(router *mux.Router) {
	router.HandleFunc("/login", mockLogin).Methods("GET")
}
