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
		Body string `json:"body"`
		Type string `json:"type"`
		*Alias
	}{
		Body:  z.Body.ID,
		Type:  mapOperationToJSON[z.Type],
		Alias: (*Alias)(z),
	})
}
