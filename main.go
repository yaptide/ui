package main

import (
	"log"
	"net/http"

	"github.com/wkozyra95/palantir/api"
)

func main() {

	router := api.NewRouter()

	log.Println("Listening...")
	log.Fatal(http.ListenAndServe(":3001", router))
}
