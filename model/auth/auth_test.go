package auth

import (
	"testing"

	"github.com/Palantir/palantir/model/test"

	"gopkg.in/mgo.v2/bson"
)

var testCases = test.MarshallingCases{
	{
		&Account{ID: bson.ObjectIdHex("58cfd607dc25403a3b691781"), Username: "username", Email: "email", Password: "password"},
		`{
		    "id": "58cfd607dc25403a3b691781",
		    "username": "username",
		    "email": "email",
		    "password": "password"
		}`,
	},
}

func TestAccountMarshal(t *testing.T) {
	test.Marshal(t, testCases)
}

func TestAccountUnmarshal(t *testing.T) {
	test.Unmarshal(t, testCases)
}

func TestAccountUnmarshalMarshalled(t *testing.T) {
	test.UnmarshalMarshalled(t, testCases)
}

func TestAccountMarshalUnmarshalled(t *testing.T) {
	test.MarshalUnmarshalled(t, testCases)
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
