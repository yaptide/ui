package api

import (
	"github.com/Palantir/palantir/api/auth"
	"github.com/Palantir/palantir/api/simulation"
	"github.com/Palantir/palantir/config"
	"github.com/gorilla/mux"
	"net/http"
)

// NewRouter define root routes
func NewRouter(config *config.Config) *mux.Router {
	router := mux.NewRouter()

	authRouter := router.PathPrefix("/auth").Subrouter()
	auth.HandleAuth(authRouter)

	simulationRouter := router.PathPrefix("/simulation").Subrouter()
	simulation.HandleSimulation(simulationRouter)

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./dist/")))

	return router
}
