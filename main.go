package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/Palantir/palantir/config"
	"github.com/Palantir/palantir/web"
)

func main() {
	conf := config.SetupConfig()
	router := web.NewRouter(conf)

	portString := ":" + strconv.FormatInt(conf.Port, 10)

	log.Printf("Config: %+v\n", *conf)
	log.Printf("Listening on %v\n", portString)
	log.Fatal(http.ListenAndServe(portString, router))
}
