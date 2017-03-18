// Package db provide MongoDB session
package db

import (
	"fmt"

	"github.com/Palantir/palantir/config"
	"gopkg.in/mgo.v2"
)

// Session contains mgo.Session, DbName, and collections DAOs
type Session struct {
	dbName  *string
	session *mgo.Session

	Account Account
}

// Copy return copy of Session. Copy is necessary to call few operations on several goroutines.
func (s *Session) Copy() Session {
	newSession := *s
	newSession.session = s.session.Copy()
	newSession.createDAOs()
	return newSession
}

func (s *Session) createDAOs() {
	s.Account = newAccount(s)
}

// Close close session created by Copy() or NewConnection().
func (s *Session) Close() {
	s.session.Close()
}

// DB return implementation handler to Database.
func (s *Session) DB() *mgo.Database {
	return s.session.DB(*s.dbName)
}

// NewConnection establish new MongoDB connection based on config.Config.
func NewConnection(conf *config.Config) (*Session, error) {
	dbURL := fmt.Sprintf("mongodb://%v:%v@%v:%d/%v",
		conf.DbUsername, conf.DbPassword, conf.DbHost, conf.DbPort, conf.DbName)
	mgoSession, err := mgo.Dial(dbURL)

	if err != nil {
		return nil, err
	}

	session := &Session{session: mgoSession, dbName: &conf.DbName}
	session.createDAOs()
	return session, nil
}
