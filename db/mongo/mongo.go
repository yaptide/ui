// Package mongo provide MongoDB implementation of db.Session interface.
package mongo

import (
	"fmt"

	"github.com/Palantir/palantir/config"
	"github.com/Palantir/palantir/db"
	"gopkg.in/mgo.v2"
)

type collection struct {
	*mgo.Collection
}

type database struct {
	session *mgo.Session
	dbName  *string
}

// C return Collection which implement db.Collection interface.
func (d database) C(name string) db.Collection {
	return collection{d.session.DB(*d.dbName).C(name)}
}

// session provide MongoDB session implementation of db.Session interface.
type session struct {
	db database
}

// NewConnection establish new MongoDB connection based on config.Config.
func NewConnection(conf *config.Config) (db.Session, error) {
	dbURL := fmt.Sprintf("mongodb://%v:%v@%v:%d/%v",
		conf.DbUsername, conf.DbPassword, conf.DbHost, conf.DbPort, conf.DbName)
	mgoSession, err := mgo.Dial(dbURL)

	if err != nil {
		return nil, err
	}

	res := session{db: database{session: mgoSession, dbName: &conf.DbName}}
	return res, nil
}

// Copy return copy of session. Copy is necessary to call few operations on several goroutines.
func (s session) Copy() db.Session {
	newSession := s
	newSession.db.session = s.db.session.Copy()
	return newSession
}

// Close close session.
func (s session) Close() {
	s.db.session.Close()
}

// DB return Database which implement db.Database.
func (s session) DB() db.Database {
	return s.db
}

// Account returns Account DAO.
func (s session) Account() db.Account {
	return db.NewAccount(s)
}
