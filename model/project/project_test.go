package project

import (
	"encoding/json"
	"testing"
)

var testCases = []struct {
	input    interface{}
	expected string
}{
	{
		Version{ID: "id", Settings: "setId", Setup: "setupId", Results: "resultsId"},
		`{"id":"id","settings":"setId","setupId":"setupId","resultsId":"resultsId"}`,
	},

	{
		Object{ID: "id", Name: "name", Versions: []Version{}},
		`{"id":"id","name":"name","versions":[]}`,
	},

	{
		List{[]Object{}},
		`{"projects":[]}`,
	},
}

func TestMarshal(t *testing.T) {
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
