package api

import (
	"github.com/gorilla/mux"
	"net/http"
	"palantir/api/auth"
)

// NewRouter define root routes
func NewRouter() *mux.Router {
	router := mux.NewRouter()

	authRouter := router.PathPrefix("/auth").Subrouter()
	auth.HandleAuth(authRouter)

	router.Handle("/", http.FileServer(http.Dir("../dist")))

	return router
}
