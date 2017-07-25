package setup

import (
	"testing"

	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
	"github.com/Palantir/palantir/model/test"
)

var testCases = test.MarshallingCases{
	{
		&Setup{
			Bodies: BodyMap{
				body.ID(1): &body.Body{ID: body.ID(1), Name: "body", Geometry: body.Sphere{}},
			},
			Zones: ZoneMap{},
		},
		`{
			"bodies": {
				"1": {
					"id": 1,
					"name": "body",
					"geometry": {
						"type": "sphere",
						"center": {
							"x": 0,
							"y": 0,
							"z": 0
						},
						"radius": 0
					}
				}
			},
			"zones": {}
		}`,
	},
	{
		&Setup{Bodies: BodyMap{}, Zones: ZoneMap{zone.ID(2): &zone.Zone{ID: zone.ID(2)}}},
		`{
			"bodies": {},
			"zones": {
				"2": {
					"id": 2,
					"name": "",
					"baseId": 0,
					"materialId": 0,
					"construction": null
				}
			}
		}`,
	},
	{
		&Setup{Bodies: BodyMap{body.ID(1): nil, body.ID(2): nil},
			Zones: ZoneMap{zone.ID(100): nil, zone.ID(200): nil}},
		`{
			"bodies": {
				"1": null,
				"2": null
			},
			"zones": {
				"100": null,
				"200": null
			}
		}`,
	},
}

func TestSetupMarshal(t *testing.T) {
	test.Marshal(t, testCases)
}

func TestSetupUnmarshal(t *testing.T) {
	test.Unmarshal(t, testCases)
}

func TestSetupUnmarshalMarshalled(t *testing.T) {
	test.UnmarshalMarshalled(t, testCases)
}

func TestSetupMarshalUnmarshalled(t *testing.T) {
	test.MarshalUnmarshalled(t, testCases)
}
