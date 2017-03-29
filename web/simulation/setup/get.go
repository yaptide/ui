package setup

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
	"github.com/Palantir/palantir/web/server"
	//"github.com/gorilla/mux"
)

type getSetupHandler struct {
	*server.Context
}

func (h *getSetupHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	//simualtionID := mux.Vars(r)["simulationId"]

	bodyExample := &body.Body{
		ID:       body.ID(1),
		Name:     "First body",
		Geometry: &body.Sphere{Center: body.Point{X: 1, Y: 1, Z: 1}, Radius: 1},
	}
	zoneExample := &zone.Zone{
		ID:     zone.ID(1),
		Name:   "First zone",
		BaseID: bodyExample.ID,
		Construction: []*zone.Operation{
			&zone.Operation{Type: zone.Intersect, BodyID: bodyExample.ID},
		},
	}
	response := &setup.Setup{
		Bodies: setup.BodyMap{1: bodyExample},
		Zones:  setup.ZoneMap{1: zoneExample},
	}

	responseBody, err := json.Marshal(response)
	if err != nil {
		log.Fatal(err.Error())
	}
	if _, err := w.Write(responseBody); err != nil {
		log.Fatal(err.Error())
	}
}
