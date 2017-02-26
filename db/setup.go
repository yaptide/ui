package db

import (
	"fmt"
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
	dbURL := fmt.Sprintf("mongodb://%v:%v@%v:%d/%v", conf.DbUsername, conf.DbPassword, conf.DbHost, conf.DbPort, conf.DbName)
	session, err := mgo.Dial(dbURL)

	// TODO: remove when there is real use for db
	if err != nil {
		log.Fatal(err.Error(), dbURL)
	}

	err2 := session.
		DB(conf.DbName).
		C("test").Insert(
		&Test{
			TestName: "sample test data",
		},
	)

	if err2 != nil {
		log.Fatal(err2.Error())
	}
}
