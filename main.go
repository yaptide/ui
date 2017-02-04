package main

import (
	"log"
	"net/http"

	"palantir/api"
)

func main() {

	router := api.NewRouter()

	log.Println("Listening...")
	http.ListenAndServe(":3001", router)
}
