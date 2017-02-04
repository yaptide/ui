package setup

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

type getSetup struct{}

func (h *getSetup) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	simualtionID := mux.Vars(r)["simulationId"]

	response := make(map[string]string)
	response["simulationId"] = simualtionID
	response["data"] = "Example data"
	responseBody, err := json.Marshal(response)
	if err != nil {
		log.Fatal(err.Error())
	}
	w.Write(responseBody)
}
