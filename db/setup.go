package db

import (
	"github.com/Palantir/palantir/config"
	"gopkg.in/mgo.v2"
	"log"
)

// Test test
type Test struct {
	TestName string
}

// SetupDbConnection estblish connection to db and Session to config
func SetupDbConnection(conf *config.Config) {
	session, err := mgo.Dial("mongodb://palantir-db-dev:password@localhost:3005/palantir-db-dev")

	// TODO: remove when there is real use for db
	if err != nil {
		log.Fatal(err.Error())
	}

	err2 := session.
		DB("palantir-db-dev").
		C("test").Insert(
		&Test{
			TestName: "sample test data",
		},
	)

	if err2 != nil {
		log.Print(err2)
	}
}
