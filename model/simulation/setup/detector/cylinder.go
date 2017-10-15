package detector

import (
	"encoding/json"
	"github.com/Palantir/palantir/model/simulation/common"
)

// Cylinder is detector with cylindrical shape directed along z-axis.
type Cylinder struct {
	Radius common.Range               `json:"radius"`
	Angle  common.Range               `json:"angle"`
	ZValue common.Range               `json:"zValue"`
	Slices common.Vec3DCylindricalInt `json:"slices"`
}

// MarshalJSON json.Marshaller implementation.
func (g Cylinder) MarshalJSON() ([]byte, error) {
	type Alias Cylinder
	return json.Marshal(struct {
		detectorType
		Alias
	}{
		detectorType: cylindricalScoringDetector,
		Alias:        (Alias)(g),
	})
}
