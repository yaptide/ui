package zone

import (
	"encoding/json"

	"github.com/Palantir/palantir/model/simulation/setup/body"
)

const (
	// Intersect TODO
	Intersect OperationType = iota
	// Subtract TODO
	Subtract
	// Union TODO
	Union
)

// OperationType TODO
type OperationType int

// Zone TODO
type Zone struct {
	ID           int64        `json:"id"`
	Name         string       `json:"name"`
	Base         *body.Body   `json:"base"`
	Construction []*Operation `json:"construction"`
}

// MarshalJSON TODO
func (z *Zone) MarshalJSON() ([]byte, error) {
	type Alias Zone
	return json.Marshal(&struct {
		Base int64 `json:"baseId"`
		*Alias
	}{
		Base:  z.Base.ID,
		Alias: (*Alias)(z),
	})
}

// Operation TODO
type Operation struct {
	Type OperationType `json:"type"`
	Body *body.Body    `json:"body"`
}

var mapOperationToJSON = map[OperationType]string{
	Intersect: "intersect",
	Subtract:  "subtract",
	Union:     "union",
}

// MarshalJSON TODO
func (z *Operation) MarshalJSON() ([]byte, error) {
	type Alias Operation
	return json.Marshal(&struct {
		Body int64  `json:"body"`
		Type string `json:"type"`
		*Alias
	}{
		Body:  z.Body.ID,
		Type:  mapOperationToJSON[z.Type],
		Alias: (*Alias)(z),
	})
}
