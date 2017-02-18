package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/Palantir/palantir/api"
	"github.com/Palantir/palantir/config"
)

func main() {
	conf := config.SetupConfig()
	router := api.NewRouter(conf)

	portString := ":" + strconv.FormatInt(conf.Port, 10)

	log.Printf("Config: %+v\n", *conf)
	log.Printf("Listening on %v\n", portString)
	log.Fatal(http.ListenAndServe(portString, router))
}
