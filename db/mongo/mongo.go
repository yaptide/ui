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
	err = res.Configure()
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (s session) Copy() db.Session {
	newSession := s
	newSession.db.session = s.db.session.Copy()
	return newSession
}

func (s session) Close() {
	s.db.session.Close()
}

func (s session) DB() db.Database {
	return s.db
}

func (s session) Account() db.Account {
	return db.NewAccount(s)
}

func (s session) Project() db.Project {
	return db.NewProject(s)
}

func (s session) Setup() db.Setup {
	return db.NewSetup(s)
}

func (s session) Result() db.Result {
	return db.NewResult(s)
}

func (s session) Configure() error {
	daos := []db.DAO{s.Account(), s.Project(), s.Setup(), s.Result()}
	for _, dao := range daos {
		err := dao.ConfigureCollection()
		if err != nil {
			return err
		}
	}
	return nil
}
