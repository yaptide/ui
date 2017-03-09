package zone

import (
	"testing"

	"github.com/Palantir/palantir/model/simulation/setup/body"
)

var opTestBody = &body.Body{}

var opTestCases = []struct {
	input    Operation
	expected string
}{
	{
		Operation{Type: Intersect, Body: opTestBody},
		`{"body":"","type":"intersect"}`,
	},

	{
		Operation{Type: Subtract, Body: opTestBody},
		`{"body":"","type":"subtract"}`,
	},

	{
		Operation{Type: Union, Body: opTestBody},
		`{"body":"","type":"union"}`,
	},
}

func TestOperationMarshalJSON(t *testing.T) {
	for _, tc := range opTestCases {
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
