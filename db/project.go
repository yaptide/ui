package db

import (
	"github.com/Palantir/palantir/model/project"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

const (
	projectCollectionName = "Project"
	accountIDKey          = "accountId"
)

// Project collection DAO.
type Project struct {
	session Session
}

// ConfigureCollection implementation of DAO interface.
func (p Project) ConfigureCollection() error {
	collection := p.session.DB().C(projectCollectionName)
	err := collection.EnsureIndex(mgo.Index{
		Key:        []string{"_id", accountIDKey},
		Unique:     true,
		Background: true,
	})
	if err != nil {
		return err
	}
	return collection.EnsureIndex(mgo.Index{
		Key:        []string{accountIDKey},
		Background: true,
	})
}

// NewProject constructor.
func NewProject(session Session) Project {
	return Project{session}
}

// FindAllByAccountID return *project.List, which contains all projects of accountID Account.
// Return err, if any db error occurs.
func (p Project) FindAllByAccountID(accountID bson.ObjectId) (*project.List, error) {
	collection := p.session.DB().C(projectCollectionName)
	result := &project.List{}

	query := bson.M{accountIDKey: accountID}
	err := collection.Find(query).All(&result.Projects)
	if err == mgo.ErrNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return result, nil
}

// Fetch find *project.Project by id and accountID.
// Return nil, if not found.
// Return err, if any db error occurs.
func (p Project) Fetch(id bson.ObjectId, accountID bson.ObjectId) (*project.Project, error) {
	collection := p.session.DB().C(projectCollectionName)
	result := &project.Project{}

	query := bson.M{"_id": id, accountIDKey: accountID}
	err := collection.Find(query).One(result)
	if err == mgo.ErrNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return result, nil
}

// Create insert project into db.
// Return err, if any db error occurs.
func (p Project) Create(project *project.Project) error {
	collection := p.session.DB().C(projectCollectionName)
	return collection.Insert(project)
}

// Update update *project.Project.
// Return db.ErrorNotFound, if project does not exists in db.
// Return another err, if any other db error occurs.
func (p Project) Update(project *project.Project) error {
	collection := p.session.DB().C(projectCollectionName)
	query := bson.M{"_id": project.ID, accountIDKey: project.AccountID}
	return collection.Update(query, project)
}

// Delete remove *project.Project from db.
// Return db.ErrorNotFound, if project does not exists in db.
// Return another err, if any other db error occurs.
func (p Project) Delete(id bson.ObjectId, accountID bson.ObjectId) error {
	collection := p.session.DB().C(projectCollectionName)
	query := bson.M{"_id": id, accountIDKey: accountID}
	return collection.Remove(query)
}
