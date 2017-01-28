package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	static := os.Getenv("PALANTIR_STATIC_FILES_PATH")
	if static == "" {
		static = "../dist"
	}

	fs := http.FileServer(http.Dir(static))
	http.Handle("/", fs)

	log.Println("Listening...")
	http.ListenAndServe(":3001", nil)
}
