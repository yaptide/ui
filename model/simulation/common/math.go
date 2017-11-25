package common

import (
	"encoding/json"
	"fmt"
)

// Distribution ...
type Distribution int64

const (
	// NoDistribution ...
	NoDistribution Distribution = iota
	// FlatDistribution ...
	FlatDistribution
	// GaussianDistribution ...
	GaussianDistribution
)

var mapDistributionToJSON = map[Distribution]string{
	NoDistribution:       "",
	FlatDistribution:     "flat",
	GaussianDistribution: "gaussian",
}

var mapJSONToDistribution = map[string]Distribution{
	"":         NoDistribution,
	"flat":     FlatDistribution,
	"gaussian": GaussianDistribution,
}

// MarshalJSON json.Marshaller implementation.
func (d Distribution) MarshalJSON() ([]byte, error) {
	res, ok := mapDistributionToJSON[d]
	if !ok {
		return nil, fmt.Errorf("Distribution.MarshalJSON: can not convert %v to string", d)
	}
	return json.Marshal(res)
}

// UnmarshalJSON json.Unmarshaller implementation.
func (d *Distribution) UnmarshalJSON(b []byte) error {
	var input string
	err := json.Unmarshal(b, &input)
	if err != nil {
		return err
	}

	newDistribution, ok := mapJSONToDistribution[input]
	if !ok {
		return fmt.Errorf("Distribution.UnmarshalJSON: can not convert %s to Distribution", input)
	}
	*d = newDistribution
	return nil
}

// Fraction ...
type Fraction float64
