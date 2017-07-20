// Package project implement project model used for storing simulation settings, setup and results.
package project

import "gopkg.in/mgo.v2/bson"

// Project represent named project, which may have multiple version.
type Project struct {
	ID          bson.ObjectId `json:"id" bson:"_id,omitempty"`
	AccountID   bson.ObjectId `json:"accountId" bson:"account_id"`
	Name        string        `json:"name" bson:"name"`
	Description string        `json:"description" bson:"description"`
	Versions    []Version     `json:"versions" bson:"versions"`
}

// List contains list of project.Project.
type List struct {
	Projects []Project `json:"projects"`
}
