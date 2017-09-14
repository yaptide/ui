package detector

import (
	"encoding/json"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
)

// Zone detector used to debug geometry.
type Zone struct {
	Zones []zone.ID `json:"zones"`
}

// MarshalJSON json.Marshaller implementation.
func (z Zone) MarshalJSON() ([]byte, error) {
	type Alias Zone
	return json.Marshal(struct {
		detectorType
		Alias
	}{
		detectorType: zoneScoringDetector,
		Alias:        (Alias)(z),
	})
}
