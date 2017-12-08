package shield

import (
	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/detector"
	"github.com/Palantir/palantir/model/simulation/setup/material"
)

// MaterialID used directly in shield input files.
type MaterialID int

// BodyID used directly in shield input files.
type BodyID int

// ZoneID used directly in shield input files.
type ZoneID int

// SimulationContext is struct used to recover data lost in process of serializing simulation data.
type SimulationContext struct {
	MapMaterialID           map[MaterialID]material.ID
	MapBodyID               map[BodyID]body.ID
	MapFilenameToDetectorID map[string]detector.ID
}

// NewSimulationContext constructor.
func NewSimulationContext() *SimulationContext {
	return &SimulationContext{
		MapMaterialID:           map[MaterialID]material.ID{},
		MapBodyID:               map[BodyID]body.ID{},
		MapFilenameToDetectorID: map[string]detector.ID{},
	}
}
