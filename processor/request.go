package processor

import (
	"github.com/Palantir/palantir/db"
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/model/simulation/setup"
)

type request interface {
	ConvertModel() error
	StartSimulation() error
	ParseResults()
}

type mainRequestComponent struct {
	session   db.Session
	versionID db.VersionID
	version   project.Version
	setup     setup.Setup
}
