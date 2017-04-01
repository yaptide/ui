// Package auth implement /auth routes.
// Responsible for login, register and account information.
package auth

import (
	"net/http"

	"github.com/Palantir/palantir/web/server"
	"github.com/gorilla/mux"
)

// HandleAuth define auth routes
func HandleAuth(router *mux.Router, context *server.Context) {
	router.Handle("/login", &loginHandler{context}).Methods(http.MethodPost)
	router.Handle("/register", &registerHandler{context}).Methods(http.MethodPost)

	router.Handle("/account",
		context.ValidationMiddleware(&fetchAccountHandler{context})).Methods(http.MethodGet)
}
