package zone

import (
	"testing"

	"github.com/Palantir/palantir/model/simulation/setup/body"
)

var zoneTestBody = &body.Body{}
var zoneTestOperations = []*Operation{
	&Operation{Type: Intersect, Body: opTestBody},
}

var zoneTestCases = []struct {
	input    Zone
	expected string
}{
	{
		Zone{ID: "1", Name: "name", Base: zoneTestBody, Construction: zoneTestOperations},
		`{"baseId":"","id":"1","name":"name","base":{"id":"","name":"","geometry":null},"construction":[{"body":"","type":"intersect"}]}`,
	},
}

func TestZoneMarshalJSON(t *testing.T) {
	for _, tc := range zoneTestCases {
		result, err := tc.input.MarshalJSON()

		if err != nil {
			t.Fatal(err.Error())
		}

		sres := string(result[:])
		if sres != tc.expected {
			t.Errorf("MarshalJSON: expected: %s, actual: %s", tc.expected, sres)
		}
	}
}
