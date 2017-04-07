package db

import (
	"github.com/Palantir/palantir/model/auth"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

const (
	accountCollectionName = "Account"
	usernameKey           = "username"
	emailKey              = "email"
)

// Account collection DAO.
type Account struct {
	session Session
}

// ConfigureCollection implementation of DAO interface.
func (a Account) ConfigureCollection() error {
	return nil
}

// NewAccount constructor.
func NewAccount(session Session) Account {
	return Account{session}
}

// FindByUsername return if exists user with login @name.
func (a Account) FindByUsername(name string) (*auth.Account, error) {
	collection := a.session.DB().C(accountCollectionName)
	result := &auth.Account{}

	query := bson.M{usernameKey: name}
	err := collection.Find(query).One(result)
	if err == mgo.ErrNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return result, nil
}

// FindByEmail return if exists user with email @email.
func (a Account) FindByEmail(email string) (*auth.Account, error) {
	collection := a.session.DB().C(accountCollectionName)
	result := &auth.Account{}

	query := bson.M{emailKey: email}
	err := collection.Find(query).One(result)
	if err == mgo.ErrNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return result, nil
}

// Create create new account in Account collection.
// Return err, if any db error occurs.
func (a Account) Create(account auth.Account) error {
	err := account.GeneratePassword()
	if err != nil {
		return err
	}

	c := a.session.DB().C(accountCollectionName)
	err = c.Insert(account)
	return err
}

// Fetch return auth.Account from db by id.
// Return nil, if not found.
// Return err, if any db error occurs.
func (a Account) Fetch(id bson.ObjectId) (*auth.Account, error) {
	c := a.session.DB().C(accountCollectionName)

	res := &auth.Account{}
	err := c.Find(bson.M{"_id": id}).One(res)

	if err == ErrNotFound {
		return nil, nil
	} else if err != nil {
		return nil, err
	}
	return res, nil
}
