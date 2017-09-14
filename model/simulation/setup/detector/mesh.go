package detector

import (
	"encoding/json"
	"github.com/Palantir/palantir/model/simulation/common"
)

// Mesh detector.
type Mesh struct {
	Center common.Point    `json:"center"`
	Size   common.Vec3D    `json:"size"`
	Slices common.Vec3DInt `json:"slices"`
}

// MarshalJSON json.Marshaller implementation.
func (m Mesh) MarshalJSON() ([]byte, error) {
	type Alias Mesh
	return json.Marshal(struct {
		detectorType
		Alias
	}{
		detectorType: meshScoringDetector,
		Alias:        (Alias)(m),
	})
}
