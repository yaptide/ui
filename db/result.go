package db

import (
	"encoding/json"

	"github.com/Palantir/palantir/model/simulation/result"
	"gopkg.in/mgo.v2/bson"
)

const (
	resultCollectionName = "SimulationResult"
)

// Result ocollection DAO.
type Result struct {
	session Session
}

// NewResult constructor.
func NewResult(session Session) Result {
	return Result{session}
}

// ConfigureCollection implementation of DAO interface.
func (s Result) ConfigureCollection() error {
	return nil
}

// Collection implementation of DAO interface.
func (s Result) Collection() Collection {
	return s.session.DB().C(resultCollectionName)
}

type dbResult struct {
	ResultID bson.ObjectId `bson:"_id"`
	*result.Result
}

type rawDbResult struct {
	ResultID  bson.ObjectId `bson:"_id"`
	RawResult []byte        `bson:"result"`
}

func (d dbResult) GetBSON() (interface{}, error) {
	marshalledResult, err := json.Marshal(d.Result)
	if err != nil {
		return nil, err
	}
	return rawDbResult{
		ResultID:  d.ResultID,
		RawResult: marshalledResult,
	}, nil
}

func (d *dbResult) SetBSON(raw bson.Raw) error {
	decoded := &rawDbResult{}
	err := raw.Unmarshal(decoded)
	if err != nil {
		return nil
	}

	result := &result.Result{}
	err = json.Unmarshal(decoded.RawResult, result)
	if err != nil {
		return err
	}

	d.ResultID = decoded.ResultID
	d.Result = result
	return nil
}

// Create Result in db, and return ObjectId of created document.
// Return err, if any db error occurs.
func (s Result) Create(result *result.Result) (bson.ObjectId, error) {
	collection := s.Collection()
	newID := bson.NewObjectId()
	newResult := dbResult{
		ResultID: newID,
		Result:   result,
	}

	err := collection.Insert(newResult)
	if err != nil {
		return "", err
	}
	return newID, nil
}

func (s Result) fetchResultIDFromVersion(versionID VersionID) (bson.ObjectId, error) {
	version, err := s.session.Project().FetchVersion(versionID)
	switch {
	case err != nil:
		return "", err
	case version == nil:
		return "", ErrNotFound
	}
	return version.ResultID, nil
}

func (s Result) fetchByID(resultID bson.ObjectId) (*result.Result, error) {
	collection := s.Collection()
	result := &dbResult{}
	err := collection.Find(bson.M{"_id": resultID}).One(result)
	switch {
	case err == ErrNotFound:
		return nil, nil
	case err != nil:
		return nil, err
	}
	return result.Result, nil
}

// Fetch *result.Result.
// Return nil, if not found.
// Return err, if any db error occurs.
func (s Result) Fetch(versionID VersionID) (*result.Result, error) {
	resultID, err := s.fetchResultIDFromVersion(versionID)
	if err != nil {
		return nil, err
	}
	return s.fetchByID(resultID)
}

func (s Result) deleteByID(resultID bson.ObjectId) error {
	collection := s.Collection()
	return collection.Remove(bson.M{"_id": resultID})
}

// Delete remove *result.Resultd from db.
// Return db.ErrorNotFound, if result does not exists in db.
// Return another err, if any other db error occurs.
func (s Result) Delete(versionID VersionID) error {
	resultID, err := s.fetchResultIDFromVersion(versionID)
	if err != nil {
		return err
	}
	return s.deleteByID(resultID)
}

// Update result.Result.
// Return db.ErrorNotFound, if result does not exists in db.
// Return another err, if any other db error occurs.
func (s Result) Update(versionID VersionID, result *result.Result) error {
	collection := s.Collection()

	resultID, err := s.fetchResultIDFromVersion(versionID)
	if err != nil {
		return err
	}

	return collection.Update(bson.M{"_id": resultID}, dbResult{
		ResultID: resultID,
		Result:   result,
	})
}
