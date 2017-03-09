package setup

import (
	"encoding/json"
	"testing"

	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
)

var testCases = []struct {
	input    Object
	expected string
}{
	{
		Object{Bodies: []*body.Body{}, Zones: []*zone.Zone{}},
		`{"bodies":[],"zones":[]}`,
	},
}

func TestSetupMarshalling(t *testing.T) {
	for _, tc := range testCases {
		result, err := json.Marshal(tc.input)

		if err != nil {
			t.Fatal(err.Error())
		}

		sres := string(result[:])
		if sres != tc.expected {
			t.Errorf("json.Marshal(%T): expected: %s, actual: %s",
				tc.input, tc.expected, sres)

		}
	}
}
