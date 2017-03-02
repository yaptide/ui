package web

import (
	"github.com/Palantir/palantir/config"
	"github.com/Palantir/palantir/web/auth"
	"github.com/Palantir/palantir/web/project"
	"github.com/Palantir/palantir/web/simulation"
	"github.com/gorilla/mux"
	"net/http"
)

// NewRouter define root routes
func NewRouter(config *config.Config) *mux.Router {
	router := mux.NewRouter()
	_ = setupServerContext(config)

	authRouter := router.PathPrefix("/auth").Subrouter()
	auth.HandleAuth(authRouter)

	simulationRouter := router.PathPrefix("/simulation").Subrouter()
	simulation.HandleSimulation(simulationRouter)

	projectRouter := router.PathPrefix("/project").Subrouter()
	project.HandleSimulation(projectRouter)

	router.PathPrefix("/").Handler(http.FileServer(http.Dir(config.StaticDirectory)))

	return router
}
