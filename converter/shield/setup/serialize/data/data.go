// Package data provide conversion from model to structures,
// which are easily serialized by shield.serialize.
package data

import (
	"fmt"

	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/setup"
)

// Data is input for shield Serialize function.
type Data struct {
	// Data needed for mat.dat file serialization.
	Materials Materials

	// Data needed for geo.dat file serialization.
	Geometry Geometry
}

// Convert simulation setup model to easily serializable data,
// which is input for shield serializer.
// Return error, if setup data are not semantically correct.
func Convert(setup *setup.Setup) (Data, *shield.SimulationContext, error) {
	err := checkSetupCompleteness(setup)
	if err != nil {
		return Data{}, nil, err
	}

	simContext := shield.NewSimulationContext()

	materials, materialIDToShield, err := convertSetupMaterials(setup.Materials, simContext)
	if err != nil {
		return Data{}, nil, err
	}

	geometry, err := convertSetupGeometry(setup.Bodies, setup.Zones, materialIDToShield, simContext)
	if err != nil {
		return Data{}, nil, err
	}

	return Data{
			Materials: materials,
			Geometry:  geometry,
		},
		simContext,
		nil
}

func checkSetupCompleteness(setup *setup.Setup) error {
	createMissingError := func(mapName string) error {
		return fmt.Errorf("[serializer]: %s map is null", mapName)
	}

	createEmptyError := func(mapName string) error {
		return fmt.Errorf("[serializer]: %s map is empty", mapName)
	}

	switch {
	case setup.Bodies == nil:
		return createMissingError("Bodies")
	case setup.Zones == nil:
		return createMissingError("Zones")
	case setup.Materials == nil:
		return createMissingError("Materials")
	case setup.Detectors == nil:
		return createMissingError("Detectors")
	}

	switch {
	case len(setup.Bodies) == 0:
		return createEmptyError("Bodies")
	case len(setup.Zones) == 0:
		return createEmptyError("Zones")
	case len(setup.Materials) == 0:
		return createEmptyError("Materials")
	case len(setup.Detectors) == 0:
		return createEmptyError("Detectors")
	}

	return nil
}
