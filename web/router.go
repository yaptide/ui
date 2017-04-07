// Package web provide main application router.
package web

import (
	"log"
	"net/http"
	"os"

	"github.com/Palantir/palantir/config"
	"github.com/Palantir/palantir/web/auth"
	"github.com/Palantir/palantir/web/projects"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/simulation"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

// NewRouter create main router, which define root routes.
func NewRouter(config *config.Config) http.Handler {
	router := mux.NewRouter()
	context, err := server.NewContext(config)
	if err != nil {
		log.Printf("server.NewContext(config) fatal error: %s\n", err.Error())
		log.Println("Probably config is incorrect")
		log.Println("Terminating application")
		os.Exit(1)
	}

	authRouter := router.PathPrefix("/auth").Subrouter()
	auth.HandleAuth(authRouter, context)

	simulationRouter := router.PathPrefix("/simulation").Subrouter()
	simulation.HandleSimulation(simulationRouter, context)

	projectsRouter := router.PathPrefix("/projects").Subrouter()
	projects.HandleProject(projectsRouter, context)

	router.PathPrefix("/").Handler(http.FileServer(http.Dir(config.StaticDirectory)))

	return handlers.CORS(
		handlers.AllowedHeaders([]string{"content-type", "x-auth-token"}),
	)(router)
}
