package list

import (
	"encoding/json"
	"github.com/Palantir/palantir/model/project"
	//"github.com/gorilla/mux"
	"log"
	"net/http"
)

type getProjectList struct{}

func (h *getProjectList) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// simualtionID := mux.Vars(r)["simulationId"]

	response := &project.List{
		Projects: []project.Object{
			project.Object{ID: 1, Name: "project name", Versions: []project.Version{
				project.Version{ID: 2, Settings: 1, Simulation: 1, Results: 1},
				project.Version{ID: 2, Settings: 1, Simulation: 1, Results: 1},
			}},
			project.Object{ID: 1, Name: "project name", Versions: []project.Version{
				project.Version{ID: 2, Settings: 1, Simulation: 1, Results: 1},
				project.Version{ID: 2, Settings: 1, Simulation: 1, Results: 1},
			}},
		},
	}

	responseBody, err := json.Marshal(response)
	if err != nil {
		log.Fatal(err.Error())
	}
	if _, err := w.Write(responseBody); err != nil {
		log.Fatal(err.Error())
	}
}
