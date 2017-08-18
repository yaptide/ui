package setup

import (
	"testing"

	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/material"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
	"github.com/Palantir/palantir/model/test"
)

var testCases = test.MarshallingCases{
	{
		&Setup{
			Materials: MaterialMap{material.ID(40): nil, material.ID(34): nil},
			Bodies:    BodyMap{body.ID(1): nil, body.ID(2): nil},
			Zones:     ZoneMap{zone.ID(100): nil, zone.ID(200): nil},
		},
		`{
			"materials": {
				"34": null,
				"40": null
			},
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
