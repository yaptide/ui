package body

import (
	"encoding/json"
	"fmt"

	"github.com/Palantir/palantir/model/simulation/common"
)

// Geometry is a variant type, which represent different geometries used in simulations.
// It must implement json.Marshaler to marshal geometry type dependant on Geometry implementation type.
type Geometry interface {
	json.Marshaler
}

type geometryType struct {
	Type string `json:"type"`
}

var (
	sphereType   = geometryType{"sphere"}
	cuboidType   = geometryType{"cuboid"}
	cylinderType = geometryType{"cylinder"}
)

func unmarshalGeometry(b json.RawMessage) (Geometry, error) {
	var geoType geometryType
	err := json.Unmarshal(b, &geoType)
	if err != nil {
		return nil, err
	}

	switch geoType {
	case sphereType:
		sphere := Sphere{}
		err = json.Unmarshal(b, &sphere)
		if err != nil {
			return nil, err
		}
		return sphere, nil
	case cuboidType:
		cuboid := Cuboid{}
		err = json.Unmarshal(b, &cuboid)
		if err != nil {
			return nil, err
		}
		return cuboid, nil
	case cylinderType:
		cylinder := Cylinder{}
		err = json.Unmarshal(b, &cylinder)
		if err != nil {
			return nil, err
		}
		return cylinder, nil

	default:
		return nil, fmt.Errorf("Can not Unmarshal \"%s\" GeometryType", geoType.Type)
	}
}

// Sphere represent sphere with given radius in space.
type Sphere struct {
	Center common.Point `json:"center"`
	Radius float64      `json:"radius"`
}

// MarshalJSON json.Marshaller implementaion.
func (s Sphere) MarshalJSON() ([]byte, error) {
	type Alias Sphere
	return json.Marshal(struct {
		geometryType
		Alias
	}{
		geometryType: sphereType,
		Alias:        (Alias)(s),
	})
}

// Cuboid represent cuboid of given sizes in a space.
type Cuboid struct {
	Center common.Point `json:"center"`
	Size   common.Vec3D `json:"size"`
}

// MarshalJSON json.Marshaller implementaion.
func (c Cuboid) MarshalJSON() ([]byte, error) {
	type Alias Cuboid
	return json.Marshal(struct {
		geometryType
		Alias
	}{
		geometryType: cuboidType,
		Alias:        (Alias)(c),
	})
}

// Cylinder represent cylinder of given sizes in a space.
type Cylinder struct {
	Center common.Point `json:"baseCenter"`
	Height float64      `json:"height"`
	Radius float64      `json:"radius"`
}

// MarshalJSON json.Marshaller implementaion.
func (c Cylinder) MarshalJSON() ([]byte, error) {
	type Alias Cylinder
	return json.Marshal(struct {
		geometryType
		Alias
	}{
		geometryType: cylinderType,
		Alias:        (Alias)(c),
	})
}
