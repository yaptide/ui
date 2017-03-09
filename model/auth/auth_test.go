package auth

import (
	"encoding/json"
	"testing"
)

var testCases = []struct {
	input    Account
	expected string
}{
	{
		Account{ID: "id", Username: "username", Email: "email", Password: "password"},
		`{"id":"id","username":"username","email":"email","password":"password"}`,
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
