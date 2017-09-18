package body

import (
	"encoding/json"
	"testing"

	"github.com/Palantir/palantir/model/simulation/common"
	"github.com/Palantir/palantir/model/test"
)

var testCases = test.MarshallingCases{
	{
		&Body{ID: ID(1), Name: "name", Geometry: Sphere{}},
		`{
			"id": 1,
			"name": "name",
			"geometry": {
				"type": "sphere",
				"center": {"x": 0, "y": 0, "z": 0},
				"radius": 0
			}
		}`,
	},

	{
		&Body{ID: ID(2), Name: "name", Geometry: Cuboid{}},
		`{
			"id": 2,
			"name": "name",
			"geometry": {
				"type": "cuboid",
				"center": {"x": 0, "y": 0, "z": 0},
				"size": {"x": 0, "y": 0, "z": 0}
			}
		}`,
	},

	{
		&Body{ID: ID(3), Name: "somethin", Geometry: Cylinder{}},
		`{
			"id": 3,
			"name": "somethin",
			"geometry": {
				"type": "cylinder",
				"baseCenter": {"x": 0, "y": 0, "z": 0},
				"height": 0,
				"radius": 0
			}
		}`,
	},

	{
		&common.Point{X: 1.0, Y: 2.0, Z: 3.0},
		`{"x":1,"y":2,"z":3}`,
	},

	{
		&common.Vec3D{X: 1.0, Y: 2.0, Z: 3.0},
		`{"x":1,"y":2,"z":3}`,
	},

	{
		&geometryType{Type: "type"},
		`{"type":"type"}`,
	},

	{
		&Sphere{Center: common.Point{X: 1.0, Y: 2.0, Z: -100.0}, Radius: 100.0},
		`{"type":"sphere","center":{"x":1,"y":2,"z":-100},"radius":100}`,
	},

	{
		&Cuboid{Center: common.Point{X: 1.0, Y: 2.0, Z: -100.0}, Size: common.Vec3D{X: 5.0, Y: 2.0, Z: 6.0}},
		`{"type":"cuboid",
		  "center":{"x":1,"y":2,"z":-100},
		  "size":  {"x":5, "y":2, "z":6}}`,
	},

	{
		&Cylinder{Center: common.Point{X: 1.0, Y: 2.0, Z: -100.0}, Height: 100.0, Radius: 40.0},
		`{"type":"cylinder","baseCenter":{"x":1,"y":2,"z":-100},"height":100,"radius":40}`,
	},
}

func TestBodyMarshal(t *testing.T) {
	test.Marshal(t, testCases)
}

func TestBodyUnmarshal(t *testing.T) {
	test.Unmarshal(t, testCases)
}

func TestBodyUnmarshalMarshalled(t *testing.T) {
	test.UnmarshalMarshalled(t, testCases)
}

func TestBodyMarshalUnmarshalled(t *testing.T) {
	test.MarshalUnmarshalled(t, testCases)
}

func TestBadGeometryTypeUnmarshalling(t *testing.T) {
	input := `{"id": 3, "name": "somethin","geometry": {"type": "xaxaxa"}}`
	body := &Body{}
	err := json.Unmarshal([]byte(input), body)
	if err == nil {
		t.Error("Unmarshalled bad geometry type without error")
	}
}
