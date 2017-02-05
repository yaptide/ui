package main

import (
	"log"
	"net/http"

	"github.com/Palantir/palantir/api"
)

func main() {

	router := api.NewRouter()

	log.Println("Listening...")
	log.Fatal(http.ListenAndServe(":3001", router))
}
