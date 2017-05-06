package db

import (
	"encoding/json"

	"github.com/Palantir/palantir/model/simulation/setup"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

const (
	setupCollectionName = "SimulationSetup"
)

// SetupID is used in DAOs methods args to indicate Setup.
type SetupID struct {
	Account bson.ObjectId `bson:"account_id"`
	Setup   bson.ObjectId `bson:"_id"`
}

func (sID SetupID) generateSelector() *bson.M {
	return &bson.M{"_id": sID.Setup, accountIDKey: sID.Account}
}

// Setup ocollection DAO.
type Setup struct {
	session Session
}

// NewSetup constructor.
func NewSetup(session Session) Setup {
	return Setup{session}
}

func (s Setup) ensureIDAndAccountIDIndex() error {
	collection := s.Collection()
	return collection.EnsureIndex(mgo.Index{
		Key:        []string{"_id", accountIDKey},
		Unique:     true,
		Background: true,
	})
}

// ConfigureCollection implementation of DAO interface.
func (s Setup) ConfigureCollection() error {
	return s.ensureIDAndAccountIDIndex()
}

// Collection implementation of DAO interface.
func (s Setup) Collection() Collection {
	return s.session.DB().C(setupCollectionName)
}

type dbSetupID struct {
	SetupID   bson.ObjectId `bson:"_id"`
	AccountID bson.ObjectId `bson:"account_id"`
	ProjectID bson.ObjectId `bson:"project_id"`
}

type dbSetup struct {
	dbSetupID
	*setup.Setup
}

type rawDbSetup struct {
	dbSetupID `bson:",inline"`
	RawSetup  []byte `bson:"setup"`
}

func (d dbSetup) GetBSON() (interface{}, error) {
	marshalledSetup, err := json.Marshal(d.Setup)
	if err != nil {
		return nil, err
	}
	return rawDbSetup{
		dbSetupID: d.dbSetupID,
		RawSetup:  marshalledSetup,
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

	d.dbSetupID = decoded.dbSetupID
	d.Setup = setup
	return nil
}

// Create create Setup in db, and return ObjectId of created document.
// Return err, if any db error occurs.
func (s Setup) Create(projectID ProjectID, setup *setup.Setup) (bson.ObjectId, error) {
	collection := s.session.DB().C(setupCollectionName)
	newID := bson.NewObjectId()
	newSetup := dbSetup{
		dbSetupID: dbSetupID{
			AccountID: projectID.Account,
			ProjectID: projectID.Project,
			SetupID:   newID,
		},
		Setup: setup,
	}

	err := collection.Insert(newSetup)
	if err != nil {
		return "", err
	}
	return newID, nil
}

// Fetch *setup.Setup.
// Return nil, if not found.
// Return err, if any db error occurs.
func (s Setup) Fetch(setupID SetupID) (*setup.Setup, error) {
	collection := s.Collection()
	result := &dbSetup{}

	selector := setupID.generateSelector()
	err := collection.Find(selector).One(result)
	switch {
	case err == ErrNotFound:
		return nil, nil
	case err != nil:
		return nil, err
	}
	return result.Setup, nil
}

// Delete remove *setup.Setupd from db.
// Return db.ErrorNotFound, if setup does not exists in db.
// Return another err, if any other db error occurs.
func (s Setup) Delete(setupID SetupID) error {
	collection := s.Collection()
	selector := setupID.generateSelector()
	return collection.Remove(selector)
}

// Update setup.Setup.
// Return db.ErrorNotFound, if setup does not exists in db.
// Return another err, if any other db error occurs.
func (s Setup) Update(setupID SetupID, setup *setup.Setup) error {
	collection := s.Collection()
	selector := setupID.generateSelector()

	marshalledSetup, err := json.Marshal(setup)
	if err != nil {
		return err
	}
	toUpdate := bson.M{"$set": bson.M{"setup": marshalledSetup}}

	return collection.Update(selector, toUpdate)
}
