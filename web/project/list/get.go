package list

import (
	"encoding/json"
	"log"

	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/web/server"
	"gopkg.in/mgo.v2/bson"
	//"github.com/gorilla/mux"

	"net/http"
)

type getProjectListHandler struct {
	*server.Context
}

func (h *getProjectListHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	//simualtionID := mux.Vars(r)["simulationId"]

	versionID := bson.ObjectIdHex("AAAAAAAAAAAAAAAAAAAAAAAA")
	setupID := bson.ObjectIdHex("BBBBBBBBBBBBBBBBBBBBBBBB")
	response := &project.List{
		Projects: []project.Project{
			project.Project{ID: "1", Name: "project name", Versions: []project.Version{
				project.Version{ID: versionID, Settings: "1", SetupID: setupID, Results: "1"},
				project.Version{ID: versionID, Settings: "1", SetupID: setupID, Results: "1"},
			}},
			project.Project{ID: "1", Name: "project name", Versions: []project.Version{
				project.Version{ID: versionID, Settings: "1", SetupID: setupID, Results: "1"},
				project.Version{ID: versionID, Settings: "1", SetupID: setupID, Results: "1"},
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
