package body

import (
	"testing"

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
				"width": 0, "height": 0
			}
		}`,
	},

	{
		&Point{X: 1.0, Y: 2.0, Z: 3.0},
		`{"x":1,"y":2,"z":3}`,
	},

	{
		&geometryType{Type: "type"},
		`{"type":"type"}`,
	},

	{
		&Sphere{Center: Point{1.0, 2.0, -100.0}, Radius: 100.0},
		`{"type":"sphere","center":{"x":1,"y":2,"z":-100},"radius":100}`,
	},

	{
		&Cuboid{Center: Point{1.0, 2.0, -100.0}, Width: 100.0, Height: 40.0},
		`{"type":"cuboid","center":{"x":1,"y":2,"z":-100},"width":100,"height":40}`,
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
