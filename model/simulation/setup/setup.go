package setup

import (
	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
)

// Object contains all simulation data
type Object struct {
	Bodies []*body.Body
	Zones  []*zone.Zone
}
