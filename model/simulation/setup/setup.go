// Package setup implement setup.Setup, which contains simulation setup data.
package setup

import (
	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
)

// BodyMap type used in Setup structure.
type BodyMap map[body.ID]*body.Body

// ZoneMap type used in Setup structure.
type ZoneMap map[zone.ID]*zone.Zone

// Setup contains all simulation data.
type Setup struct {
	Bodies BodyMap `json:"bodies"`
	Zones  ZoneMap `json:"zones"`
}
