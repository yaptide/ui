package db

import (
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/model/simulation/setup"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

const (
	projectCollectionName = "Project"
	accountIDKey          = "account_id"
)

// ProjectID is used in DAOs methods args to indicate Project.
type ProjectID struct {
	Account bson.ObjectId
	Project bson.ObjectId
}

// VersionID is used in DAOs methods args to indicate project Version.
type VersionID struct {
	Account bson.ObjectId
	Project bson.ObjectId
	Version project.VersionID
}

// Project collection DAO.
type Project struct {
	session Session
}

func (p Project) ensureIDAndAccountIDIndex() error {
	collection := p.session.DB().C(projectCollectionName)

	return collection.EnsureIndex(mgo.Index{
		Key:        []string{"_id", accountIDKey},
		Unique:     true,
		Background: true,
	})
}

func (p Project) ensureAccountIDIndex() error {
	collection := p.session.DB().C(projectCollectionName)

	return collection.EnsureIndex(mgo.Index{
		Key:        []string{accountIDKey},
		Background: true,
	})
}

// ConfigureCollection implementation of DAO interface.
func (p Project) ConfigureCollection() error {
	err := p.ensureIDAndAccountIDIndex()
	if err != nil {
		return err
	}
	return p.ensureAccountIDIndex()
}

// NewProject constructor.
func NewProject(session Session) Project {
	return Project{session}
}

// FindAllByAccountID return *project.List, which contains all projects of accountID Account.
// Return err, if any db error occurs.
func (p Project) FindAllByAccountID(accountID bson.ObjectId) (*project.List, error) {
	collection := p.session.DB().C(projectCollectionName)
	result := &project.List{Projects: []project.Project{}}

	query := bson.M{accountIDKey: accountID}
	err := collection.Find(query).All(&result.Projects)
	if err != nil {
		return nil, err
	}
	return result, nil
}

// Fetch *project.Project.
// Return nil, if not found.
// Return err, if any db error occurs.
func (p Project) Fetch(projectID ProjectID) (*project.Project, error) {
	collection := p.session.DB().C(projectCollectionName)
	result := &project.Project{}

	query := bson.M{"_id": projectID.Project, accountIDKey: projectID.Account}
	err := collection.Find(query).One(result)
	switch {
	case err == ErrNotFound:
		return nil, nil
	case err != nil:
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

func (p Project) deleteVersionChilds(version *project.Version) error {
	//TODO delete childs from db
	return nil
}

func (p Project) deleteAllVersionsWithChilds(dbProject *project.Project) error {
	for _, version := range dbProject.Versions {
		err := p.deleteVersionChilds(&version)
		if err != nil {
			return err
		}
	}
	return nil
}

// Delete remove *project.Project from db.
// Return db.ErrorNotFound, if project does not exists in db.
// Return another err, if any other db error occurs.
func (p Project) Delete(projectID ProjectID) error {
	collection := p.session.DB().C(projectCollectionName)
	dbProject, err := p.Fetch(projectID)
	switch {
	case dbProject == nil:
		return ErrNotFound
	case err != nil:
		return err
	}

	err = p.deleteAllVersionsWithChilds(dbProject)
	if err != nil {
		return err
	}

	query := bson.M{"_id": projectID.Project, accountIDKey: projectID.Account}
	return collection.Remove(query)
}

func extractVersionFromProject(dbProject *project.Project, id project.VersionID) *project.Version {
	if project.VersionID(len(dbProject.Versions)) <= id {
		return nil
	}
	return &dbProject.Versions[id]
}

// FetchVersion find *project.Version.
// Return nil, if not found.
// Return err, if any db error occurs.
func (p Project) FetchVersion(versionID VersionID) (*project.Version, error) {
	dbProject, err := p.Fetch(
		ProjectID{
			Account: versionID.Account,
			Project: versionID.Project,
		})
	switch {
	case err != nil:
		return nil, err
	case dbProject == nil:
		return nil, nil
	}

	return extractVersionFromProject(dbProject, versionID.Version), nil
}

type versionPrototype struct {
	ID       project.VersionID
	Settings interface{}
	Setup    *setup.Setup
	Results  interface{}
}

func (p Project) createNewVersionFromPrototype(prototype versionPrototype) (*project.Version, error) {
	newVersion := &project.Version{ID: prototype.ID, Settings: prototype.Settings}
	// TODO add setup and results creation in db
	return newVersion, nil
}

// CreateVersion create new project.Version for Project.
// Version childs like Setup are created in others collections and assigned to Version as manual db references.
// All childs are initialized by empty value.
// Return nil, if project not found.
// Return err, if any db error occurs.
func (p Project) CreateVersion(projectID ProjectID) (*project.Version, error) {
	dbProject, err := p.Fetch(projectID)
	switch {
	case err != nil:
		return nil, err
	case dbProject == nil:
		return nil, nil
	}

	newVersionID := project.VersionID(len(dbProject.Versions))
	newVersionPrototype := versionPrototype{
		ID:       newVersionID,
		Settings: nil,
		Setup:    &setup.Setup{},
		Results:  nil,
	}
	newVersion, err := p.createNewVersionFromPrototype(newVersionPrototype)
	if err != nil {
		return nil, err
	}
	dbProject.Versions = append(dbProject.Versions, *newVersion)

	err = p.Update(dbProject)
	if err != nil {
		return nil, err
	}
	return newVersion, nil
}

// CreateVersionFrom works like CreateVersion, but childs are copied from existingVersion childs.
// Return nil, if version not found.
// Return err, if any db error occurs.
func (p Project) CreateVersionFrom(existingVersionID VersionID) (*project.Version, error) {
	dbProject, err := p.Fetch(ProjectID{
		Account: existingVersionID.Account,
		Project: existingVersionID.Project,
	})
	switch {
	case err != nil:
		return nil, err
	case dbProject == nil:
		return nil, nil
	}

	existingVersion := extractVersionFromProject(dbProject, existingVersionID.Version)
	if existingVersion == nil {
		return nil, nil
	}

	newVersionID := project.VersionID(len(dbProject.Versions))
	// TODO fetch setup and results, then put them into versionPrototype
	newVersionPrototype := versionPrototype{
		ID:       newVersionID,
		Settings: existingVersion.Settings,
		Setup:    &setup.Setup{},
		Results:  nil,
	}
	newVersion, err := p.createNewVersionFromPrototype(newVersionPrototype)
	if err != nil {
		return nil, err
	}
	dbProject.Versions = append(dbProject.Versions, *newVersion)

	err = p.Update(dbProject)
	if err != nil {
		return nil, err
	}
	return newVersion, nil
}
