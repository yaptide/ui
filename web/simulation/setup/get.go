package setup

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
	//"github.com/gorilla/mux"
)

type getSetup struct{}

func (h *getSetup) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// simualtionID := mux.Vars(r)["simulationId"]
	bodyExample := &body.Body{
		ID:       1,
		Name:     "First body",
		Geometry: &body.SphereGeometry{Center: &body.Point{X: 1, Y: 1, Z: 1}, Radius: 1},
	}
	zoneExample := &zone.Zone{
		ID:   3,
		Name: "First zone",
		Base: bodyExample,
		Construction: []*zone.Operation{
			&zone.Operation{Type: zone.Intersect, Body: bodyExample},
		},
	}
	response := &setup.Object{
		Bodies: []*body.Body{bodyExample},
		Zones:  []*zone.Zone{zoneExample},
	}

	responseBody, err := json.Marshal(response)
	if err != nil {
		log.Fatal(err.Error())
	}
	if _, err := w.Write(responseBody); err != nil {
		log.Fatal(err.Error())
	}
}
