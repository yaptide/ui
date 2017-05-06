// Package db provide interfaces which provide generalized operations on databases.
package db

import "gopkg.in/mgo.v2"

// ErrNotFound error is returned, when CRUD method can not find query result.
var ErrNotFound = mgo.ErrNotFound

// Collection is the interface implemented by types that can perform database CRUD operations.
type Collection interface {
	Find(query interface{}) *mgo.Query
	Count() (n int, err error)
	FindId(id interface{}) *mgo.Query
	Insert(docs ...interface{}) error
	Remove(selector interface{}) error
	Update(selector interface{}, update interface{}) error
	Upsert(selector interface{}, update interface{}) (info *mgo.ChangeInfo, err error)
	EnsureIndex(index mgo.Index) error
	RemoveAll(selector interface{}) (info *mgo.ChangeInfo, err error)
}

// Database provide access to Database Collection.
type Database interface {
	C(name string) Collection
}

// Session represents a communication session with the database.
type Session interface {
	// Copy copy Session handler.
	// Copy is necessary, if you need perfom db operations on several goroutines at once.
	Copy() Session

	//Close close Session.
	Close()

	DB() Database

	Account() Account
	Project() Project
	Setup() Setup

	// Configure configure db and collections.
	Configure() error
}

// DAO represent collection DAO.
type DAO interface {
	// ConfigureCollection configure collection configuration such as Indexes.
	ConfigureCollection() error
	Collection() Collection
}
