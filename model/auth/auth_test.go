package auth

import (
	"encoding/json"
	"testing"

	"gopkg.in/mgo.v2/bson"
)

var testCases = []struct {
	input    Account
	expected string
}{
	{
		Account{ID: bson.ObjectIdHex("58cfd607dc25403a3b691781"), Username: "username", Email: "email", Password: "password"},
		`{"id":"58cfd607dc25403a3b691781","username":"username","email":"email","password":"password"}`,
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

func TestGeneratePassword(t *testing.T) {
	account := Account{Password: "test"}
	err := account.GeneratePassword()
	if err != nil {
		t.Error(err.Error())
	}

	if account.Password == "" {
		t.Error("Empty password after encrypt operation")
	}

}

func TestCompareValidPassword(t *testing.T) {
	password := "test"
	account := Account{Password: password}
	err := account.GeneratePassword()
	if err != nil {
		t.Error(err.Error())
	}

	res := account.ComparePassword(password)
	if !res {
		t.Errorf("Not valid password")

	}
}

func TestCompareInvalidPassword(t *testing.T) {
	password := "test"
	invalidPassword := "invalid pass"
	account := Account{Password: password}
	err := account.GeneratePassword()
	if err != nil {
		t.Error(err.Error())
	}

	res := account.ComparePassword(invalidPassword)
	if res {
		t.Errorf("Invalid password validated")
	}
}
