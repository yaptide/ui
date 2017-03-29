package zone

import (
	"encoding/json"
	"fmt"

	"github.com/Palantir/palantir/model/simulation/setup/body"
)

// OperationType determines operation type.
// OperationTypes are based on mathematical operations on sets.
type OperationType int

const (
	// Intersect operation: A ∩ B.
	Intersect OperationType = iota
	// Subtract operation: A \ B.
	Subtract
	// Union operation: A ∪ B.
	Union
)

var mapOperationToJSON = map[OperationType]string{
	Intersect: "intersect",
	Subtract:  "subtract",
	Union:     "union",
}

var mapJSONToOperation = map[string]OperationType{
	"intersect": Intersect,
	"subtract":  Subtract,
	"union":     Union,
}

// Operation determines construction of Zone.
type Operation struct {
	BodyID body.ID       `json:"bodyId"`
	Type   OperationType `json:"-"`
}

type rawOperation struct {
	BodyID body.ID `json:"bodyId"`
	Type   string  `json:"type"`
}

// MarshalJSON custom Marshal function.
func (o *Operation) MarshalJSON() ([]byte, error) {

	typeStr, ok := mapOperationToJSON[o.Type]
	if !ok {
		return nil, fmt.Errorf("Operation.MarshalJSON: can not convert OperationType: %v to string",
			o.Type)

	}
	return json.Marshal(&rawOperation{
		BodyID: o.BodyID,
		Type:   typeStr,
	})
}

// UnmarshalJSON custom Unmarshal function.
func (o *Operation) UnmarshalJSON(b []byte) error {
	rOperation := rawOperation{}
	err := json.Unmarshal(b, &rOperation)
	if err != nil {
		return err
	}

	operationType, ok := mapJSONToOperation[rOperation.Type]
	if !ok {
		return fmt.Errorf("Operation.UnmarshalJSON: can not convert string: %v to OperationType",
			o.Type)
	}
	o.BodyID = rOperation.BodyID
	o.Type = operationType
	return nil
}
