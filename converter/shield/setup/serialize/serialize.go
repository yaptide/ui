// Package serialize provide Serialize function to convert model -> SHIELD input files.
package serialize

import (
	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/material"
)

const (
	//beamDatFile      = "beam.dat"
	//detectorsDatFile = "detect.dat"
	geometryDatFile  = "geo.dat"
	materialsDatFile = "mat.dat"
)

type serializerContext struct {
	materialIDToShield map[material.ID]shield.MaterialID

	bodyIDToShield map[body.ID]shield.BodyID
}

type shieldSerializer struct {
	setup *setup.Setup
	serializerContext
	simulationContext *shield.SimulationContext
}

func newShieldSerializer(setup *setup.Setup) *shieldSerializer {
	return &shieldSerializer{
		setup: setup,
		serializerContext: serializerContext{
			materialIDToShield: make(map[material.ID]shield.MaterialID),
			bodyIDToShield:     make(map[body.ID]shield.BodyID),
		},
		simulationContext: &shield.SimulationContext{
			MapMaterialID: make(map[shield.MaterialID]material.ID),
			MapBodyID:     make(map[shield.BodyID]body.ID),
		},
	}
}

// Result store result of Serialize() function.
type Result struct {
	SimulationContext *shield.SimulationContext

	// Result files map where: key is file name, value is file content.
	Files map[string]string
}

// Serialize setup.Setup.
func Serialize(setup *setup.Setup) (Result, error) {
	serializer := newShieldSerializer(setup)
	res := Result{
		SimulationContext: serializer.simulationContext,
		Files:             make(map[string]string),
	}

	type SerializerFunc func(*shieldSerializer) (string, error)

	for fileName, fileSeralizer := range map[string]SerializerFunc{
		materialsDatFile: serializeMat,
		geometryDatFile:  serializeGeo,
	} {
		serOutput, err := fileSeralizer(serializer)
		if err != nil {
			return res, err
		}
		res.Files[fileName] = serOutput
	}
	res.SimulationContext = serializer.simulationContext

	return res, nil
}
