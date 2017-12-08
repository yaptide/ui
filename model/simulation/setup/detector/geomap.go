package detector

import (
	"encoding/json"

	"github.com/Palantir/palantir/model/simulation/common"
)

// Geomap detector used to debug geometry.
type Geomap struct {
	Center common.Point    `json:"center"`
	Size   common.Vec3D    `json:"size"`
	Slices common.Vec3DInt `json:"slices"`
}

// MarshalJSON json.Marshaller implementation.
func (g Geomap) MarshalJSON() ([]byte, error) {
	type Alias Geomap
	return json.Marshal(struct {
		detectorType
		Alias
	}{
		detectorType: geomapDetector,
		Alias:        (Alias)(g),
	})
}
