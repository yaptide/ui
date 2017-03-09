package zone

import (
	"encoding/json"

	"github.com/Palantir/palantir/model/simulation/setup/body"
)

// Zone TODO
type Zone struct {
	ID           string       `json:"id"`
	Name         string       `json:"name"`
	Base         *body.Body   `json:"base"`
	Construction []*Operation `json:"construction"`
}

// MarshalJSON TODO
func (z *Zone) MarshalJSON() ([]byte, error) {
	type Alias Zone
	return json.Marshal(&struct {
		Base string `json:"baseId"`
		*Alias
	}{
		Base:  z.Base.ID,
		Alias: (*Alias)(z),
	})
}
