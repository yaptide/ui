package material

import (
	"encoding/json"
	"fmt"
)

// StateOfMatter represent state of material.
type StateOfMatter int

const (
	// Solid state of matter.
	Solid StateOfMatter = iota
	// Gas state of matter.
	Gas
	// Liquid state of matter.
	Liquid
)

var mapStateToJSON = map[StateOfMatter]string{
	Solid:  "solid",
	Gas:    "gas",
	Liquid: "liquid",
}

var mapJSONToState = map[string]StateOfMatter{
	"solid":  Solid,
	"gas":    Gas,
	"liquid": Liquid,
}

// MarshalJSON json.Marshaller implementation.
func (s StateOfMatter) MarshalJSON() ([]byte, error) {
	res, ok := mapStateToJSON[s]
	if !ok {
		return nil,
			fmt.Errorf("StateOfMatter.MarshalJSON: can not convert %v to string", s)
	}
	return json.Marshal(res)
}

// UnmarshalJSON json.Unmarshaller implementation.
func (s *StateOfMatter) UnmarshalJSON(b []byte) error {
	var input string
	err := json.Unmarshal(b, &input)
	if err != nil {
		return err
	}

	newState, ok := mapJSONToState[input]
	if !ok {
		return fmt.Errorf(
			"StateOfMatter.UnmarshalJSON: can not convert %s to StateOfMatter", input)
	}
	*s = newState
	return nil
}
