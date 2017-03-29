// Package auth implement Account model used for authentication.
package auth

import (
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2/bson"
)

// Account contains account login data.
type Account struct {
	ID       bson.ObjectId `json:"id,omitempty" bson:"_id,omitempty"`
	Username string        `json:"username"`
	Email    string        `json:"email"`
	Password string        `json:"password,omitempty"`
}

// GeneratePassword encrypt a.Password using bcrypt algorithm.
func (a *Account) GeneratePassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(a.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	a.Password = string(hashedPassword)

	return nil
}

// ComparePassword return true, if argument hash is equals to a.Password.
func (a *Account) ComparePassword(password string) bool {
	hashedPassword := []byte(a.Password)
	err := bcrypt.CompareHashAndPassword(hashedPassword, []byte(password))
	return err == nil
}
