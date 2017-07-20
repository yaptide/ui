package db

import (
	"encoding/json"

	"github.com/Palantir/palantir/model/simulation/setup"
	"gopkg.in/mgo.v2/bson"
)

const (
	setupCollectionName = "SimulationSetup"
)

// Setup ocollection DAO.
type Setup struct {
	session Session
}

// NewSetup constructor.
func NewSetup(session Session) Setup {
	return Setup{session}
}

// ConfigureCollection implementation of DAO interface.
func (s Setup) ConfigureCollection() error {
	return nil
}

// Collection implementation of DAO interface.
func (s Setup) Collection() Collection {
	return s.session.DB().C(setupCollectionName)
}

type dbSetup struct {
	SetupID bson.ObjectId `bson:"_id"`
	*setup.Setup
}

type rawDbSetup struct {
	SetupID  bson.ObjectId `bson:"_id"`
	RawSetup []byte        `bson:"setup"`
}

func (d dbSetup) GetBSON() (interface{}, error) {
	marshalledSetup, err := json.Marshal(d.Setup)
	if err != nil {
		return nil, err
	}
	return rawDbSetup{
		SetupID:  d.SetupID,
		RawSetup: marshalledSetup,
	}, nil
}

func (d *dbSetup) SetBSON(raw bson.Raw) error {
	decoded := &rawDbSetup{}
	err := raw.Unmarshal(decoded)
	if err != nil {
		return nil
	}

	setup := &setup.Setup{}
	err = json.Unmarshal(decoded.RawSetup, setup)
	if err != nil {
		return err
	}

	d.SetupID = decoded.SetupID
	d.Setup = setup
	return nil
}

// Create Setup in db, and return ObjectId of created document.
// Return err, if any db error occurs.
func (s Setup) Create(setup *setup.Setup) (bson.ObjectId, error) {
	collection := s.Collection()
	newID := bson.NewObjectId()
	newSetup := dbSetup{
		SetupID: newID,
		Setup:   setup,
	}

	err := collection.Insert(newSetup)
	if err != nil {
		return "", err
	}
	return newID, nil
}

func (s Setup) fetchSetupIDFromVersion(versionID VersionID) (bson.ObjectId, error) {
	version, err := s.session.Project().FetchVersion(versionID)
	switch {
	case err != nil:
		return "", err
	case version == nil:
		return "", ErrNotFound
	}
	return version.SetupID, nil
}

func (s Setup) fetchByID(setupID bson.ObjectId) (*setup.Setup, error) {
	collection := s.Collection()
	setup := &dbSetup{}
	err := collection.Find(bson.M{"_id": setupID}).One(setup)
	switch {
	case err == ErrNotFound:
		return nil, nil
	case err != nil:
		return nil, err
	}
	return setup.Setup, nil
}

// Fetch *setup.Setup.
// Return nil, if not found.
// Return err, if any db error occurs.
func (s Setup) Fetch(versionID VersionID) (*setup.Setup, error) {
	setupID, err := s.fetchSetupIDFromVersion(versionID)
	if err != nil {
		return nil, err
	}
	return s.fetchByID(setupID)
}

func (s Setup) deleteByID(setupID bson.ObjectId) error {
	collection := s.Collection()
	return collection.Remove(bson.M{"_id": setupID})
}

// Delete remove *setup.Setupd from db.
// Return db.ErrorNotFound, if setup does not exists in db.
// Return another err, if any other db error occurs.
func (s Setup) Delete(versionID VersionID) error {
	setupID, err := s.fetchSetupIDFromVersion(versionID)
	if err != nil {
		return err
	}
	return s.deleteByID(setupID)
}

// Update setup.Setup.
// Return db.ErrorNotFound, if setup does not exists in db.
// Return another err, if any other db error occurs.
func (s Setup) Update(versionID VersionID, setup *setup.Setup) error {
	collection := s.Collection()

	setupID, err := s.fetchSetupIDFromVersion(versionID)
	if err != nil {
		return err
	}

	return collection.Update(bson.M{"_id": setupID}, dbSetup{
		SetupID: setupID,
		Setup:   setup,
	})
}
