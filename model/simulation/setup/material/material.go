// Package material implement material model.
package material

import (
	"encoding/json"
	"fmt"

	"github.com/Palantir/palantir/model/color"
)

// ID is key type in Material map.
type ID int64

// Material defines the zone material that is used in the simulation.
type Material struct {
	ID    ID          `json:"id"`
	Color color.Color `json:"color"`
	Type  Type        `json:"material"`
}

// UnmarshalJSON custom Unmarshal function.
// material.Type is recognized by material/type in json.
func (m *Material) UnmarshalJSON(b []byte) error {
	type rawBody struct {
		ID      ID              `json:"id"`
		Color   color.Color     `json:"color"`
		TypeRaw json.RawMessage `json:"material"`
	}

	var raw rawBody
	err := json.Unmarshal(b, &raw)
	if err != nil {
		return err
	}
	m.ID = raw.ID
	m.Color = raw.Color

	matType, err := unmarshalMaterialType(raw.TypeRaw)
	if err != nil {
		return err
	}
	m.Type = matType
	return nil
}

func unmarshalMaterialType(b json.RawMessage) (Type, error) {
	var matType materialType
	err := json.Unmarshal(b, &matType)
	if err != nil {
		return nil, err
	}

	switch matType {
	case predefinedType:
		predefined := Predefined{}
		err = json.Unmarshal(b, &predefined)
		if err != nil {
			return nil, err
		}
		return predefined, nil
	case compoundType:
		compound := Compound{}
		err = json.Unmarshal(b, &compound)
		if err != nil {
			return nil, err
		}
		return compound, nil
	case voxelType:
		voxel := Voxel{}
		err = json.Unmarshal(b, &voxel)
		if err != nil {
			return nil, err
		}
		return voxel, nil

	default:
		return nil, fmt.Errorf("Can not Unmarshal \"%s\" material.Type", matType.Type)
	}
}

// Type is interface for material type.
// It must implement json.Marshaler to marshal material Type
// dependant on material Type implementation type.
type Type interface {
	json.Marshaler
}

type materialType struct {
	Type string `json:"type"`
}

var (
	predefinedType = materialType{"predefined"}
	compoundType   = materialType{"compound"}
	voxelType      = materialType{"voxel"}
)
