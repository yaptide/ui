package api

import (
	"github.com/gorilla/mux"
	"github.com/Palantir/palantir/api/auth"
	"github.com/Palantir/palantir/api/simulation"
	"net/http"
)

// NewRouter define root routes
func NewRouter() *mux.Router {
	router := mux.NewRouter()

	authRouter := router.PathPrefix("/auth").Subrouter()
	auth.HandleAuth(authRouter)

	simulationRouter := router.PathPrefix("/simulation").Subrouter()
	simulation.HandleSimulation(simulationRouter)

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./dist/")))

	return router
}
