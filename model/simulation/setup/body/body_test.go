package body

import (
	"encoding/json"
	"testing"
)

var testCases = []struct {
	input    interface{}
	expected string
}{
	{
		Body{ID: "1", Name: "name", Geometry: GenericGeometry{}},
		`{"id":"1","name":"name","geometry":{"type":""}}`,
	},

	{
		Point{X: 1.0, Y: 2.0, Z: 3.0},
		`{"x":1,"y":2,"z":3}`,
	},

	{
		GenericGeometry{Type: "type"},
		`{"type":"type"}`,
	},

	{
		SphereGeometry{Center: Point{1.0, 2.0, -100.0}, Radius: 100.0},
		`{"type":"","center":{"x":1,"y":2,"z":-100},"radius":100}`,
	},

	{
		CuboidGeometry{Center: Point{1.0, 2.0, -100.0}, Width: 100.0, Height: 40.0},
		`{"type":"","center":{"x":1,"y":2,"z":-100},"width":100,"height":40}`,
	},
}

func TestMarshal(t *testing.T) {
	for _, tc := range testCases {
		result, err := json.Marshal(tc.input)

		if err != nil {
			t.Fatal(err.Error())
		}

		sres := string(result[:])
		if sres != tc.expected {
			t.Errorf("json.Marshal(%T): expected: %s, actual: %s",
				tc.input, tc.expected, sres)

		}
	}
}
