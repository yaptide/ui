package db

import (
	"github.com/Palantir/palantir/model/auth"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

const accountC = "Account"

// Account collection DAO
type Account struct {
	session *Session
}

// NewAccount constructor
func newAccount(session *Session) Account {
	return Account{session: session}
}

// IsRegistered returns true, if account already exists in db.
// Return err, if any db error occurs.
func (a *Account) IsRegistered(account *auth.Account) (bool, error) {
	c := a.session.DB().C(accountC)

	queries := []bson.M{bson.M{"username": account.Username}, bson.M{"email": account.Email}}
	for _, query := range queries {
		n, err := c.Find(query).Count()
		if err != nil {
			return false, err
		}
		if n > 0 {
			return true, nil
		}
	}

	return false, nil
}

// Create create new account in Account collection.
// Return err, if any db error occurs.
func (a *Account) Create(account auth.Account) error {
	err := account.GeneratePassword()
	if err != nil {
		return err
	}

	c := a.session.DB().C(accountC)
	err = c.Insert(account)
	if err != nil {
		return err
	}
	return nil
}

// GetIfAuthenticated return Account from db, if account Username/Email and Password are valid.
// Return nil, if not found or password is invalid.
// Return err, if any db error occurs.
func (a *Account) GetIfAuthenticated(account *auth.Account) (*auth.Account, error) {
	c := a.session.DB().C(accountC)

	res := &auth.Account{}

	for _, loginField := range []string{"username", "email"} {
		err := c.Find(bson.M{loginField: account.Username}).One(res)
		switch {
		case err == mgo.ErrNotFound:
			return nil, nil
		case err != nil:
			return nil, err
		case res.ComparePassword(account.Password):
			return res, nil
		}
	}
	return nil, nil
}

// GetByID return auth.Account from db by id.
// Return nil, if not found.
// Return err, if any db error occurs.
func (a *Account) GetByID(id bson.ObjectId) (*auth.Account, error) {
	c := a.session.DB().C(accountC)

	res := &auth.Account{}
	err := c.Find(bson.M{"_id": id}).One(res)

	if err == mgo.ErrNotFound {
		return nil, nil
	} else if err != nil {
		return nil, err
	}
	return res, nil
}
