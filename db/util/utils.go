// Package util provide universal operations on collections.
package util

import (
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Exists check if collection contains items specified by query object.
func Exists(collection *mgo.Collection, query bson.M) (bool, error) {
	count, err := collection.Find(query).Count()
	if err != nil {
		return false, err
	}
	if count == 0 {
		return false, nil
	}
	return true, nil
}
