package setup

import (
	"bytes"
	"testing"

	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
)

func TestWriteColumnsIndicators(t *testing.T) {
	testCases := []struct {
		columns  []int
		expected string
	}{
		{
			[]int{5, 5, 10, 50},
			"*---><---><--------><------------------------------------------------>\n",
		},
		{
			[]int{10, 10, 10, 10, 10, 10, 10},
			"*--------><--------><--------><--------><--------><--------><-------->\n",
		},
	}

	for _, tc := range testCases {
		resBuff := &bytes.Buffer{}
		writeColumnsIndicators(resBuff, tc.columns)
		if resBuff.String() != tc.expected {
			t.Errorf("\nExpected:\n%s\nActual:\n%s", tc.expected, resBuff.String())
		}
	}
}

func TestGeoSerializing(t *testing.T) {

	shieldSerializer := NewShieldSerializer(&setup.Setup{
		Bodies: setup.BodyMap{
			body.ID(1): &body.Body{
				ID:       body.ID(1),
				Name:     "body1",
				Geometry: body.Sphere{Center: body.Point{X: 1.0, Y: 2.0, Z: 3.0}, Radius: 4.0},
			},
			body.ID(2): &body.Body{
				ID:   body.ID(2),
				Name: "body2",
				Geometry: body.Cuboid{
					Center: body.Point{X: 10.0, Y: 20.0, Z: 333.0},
					Size:   body.Vec3D{X: 100.0, Y: 200.0, Z: 0.0},
				},
			},
			body.ID(54): &body.Body{
				ID:   body.ID(54),
				Name: "body54",
				Geometry: body.Cylinder{
					Center: body.Point{X: 10.0, Y: 20.0, Z: 30.0},
					Height: 44.4,
					Radius: 3.14,
				},
			},
		},
		Zones: setup.ZoneMap{zone.ID(100): nil, zone.ID(200): nil},
	})

	err := shieldSerializer.Serialize()
	if err != nil {
		t.Error(err)
	}
	t.Log(shieldSerializer.ResultFiles)
}
