// Package project implement project model used for storing simulation settings, setup and results.
package project

import "gopkg.in/mgo.v2/bson"

// Project represent named project, which may have multiple version.
type Project struct {
	ID       bson.ObjectId `json:"id" bson:"_id,omitempty"`
	Name     string        `json:"name"`
	Versions []Version     `json:"versions"`
}

// List contains list of project.Project.
type List struct {
	Projects []Project `json:"projects"`
}

// Version is project version, which contains settting and simulation setup/results.
type Version struct {
	ID       bson.ObjectId `json:"id" bson:"_id,omitempty"`
	Settings interface{}   `json:"settings"` // TODO create setting model
	SetupID  bson.ObjectId `json:"setup"`
	Results  interface{}   `json:"results"` // TODO create results
}
