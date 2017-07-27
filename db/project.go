package db

import (
	"fmt"

	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/model/simulation/result"
	"github.com/Palantir/palantir/model/simulation/setup"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

const (
	projectCollectionName = "Project"
)

// ProjectID is used in DAOs methods args to indicate Project.
type ProjectID struct {
	Account bson.ObjectId
	Project bson.ObjectId
}

func (pID ProjectID) generateSelector() *bson.M {
	return &bson.M{"_id": pID.Project, accountIDKey: pID.Account}
}

// VersionID is used in DAOs methods args to indicate project Version.
type VersionID struct {
	Account bson.ObjectId
	Project bson.ObjectId
	Version project.VersionID
}

func (vID VersionID) toProjectID() ProjectID {
	return ProjectID{
		Account: vID.Account,
		Project: vID.Project,
	}
}

// Project collection DAO.
type Project struct {
	session Session
}

// NewProject constructor.
func NewProject(session Session) Project {
	return Project{session}
}

func (p Project) ensureIDAndAccountIDIndex() error {
	collection := p.Collection()
	return collection.EnsureIndex(mgo.Index{
		Key:        []string{"_id", accountIDKey},
		Unique:     true,
		Background: true,
	})
}

func (p Project) ensureAccountIDIndex() error {
	collection := p.Collection()
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

// Collection implementation of DAO interface.
func (p Project) Collection() Collection {
	return p.session.DB().C(projectCollectionName)
}

// FindAllByAccountID return *project.List, which contains all projects of accountID Account.
// Return err, if any db error occurs.
func (p Project) FindAllByAccountID(accountID bson.ObjectId) (*project.List, error) {
	collection := p.Collection()
	result := &project.List{Projects: []project.Project{}}

	selector := bson.M{accountIDKey: accountID}
	err := collection.Find(selector).All(&result.Projects)
	if err != nil {
		return nil, err
	}
	return result, nil
}

// Fetch *project.Project.
// Return nil, if not found.
// Return err, if any db error occurs.
func (p Project) Fetch(projectID ProjectID) (*project.Project, error) {
	collection := p.Collection()
	result := &project.Project{}

	selector := projectID.generateSelector()
	err := collection.Find(selector).One(result)
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
	collection := p.Collection()
	return collection.Insert(project)
}

// Update update *project.Project.
// Return db.ErrorNotFound, if project does not exists in db.
// Return another err, if any other db error occurs.
func (p Project) Update(project *project.Project) error {
	collection := p.Collection()
	selector := ProjectID{Account: project.AccountID, Project: project.ID}.generateSelector()
	return collection.Update(selector, project)
}

func (p Project) deleteVersionChilds(version *project.Version, projectID ProjectID) error {
	err := p.session.Setup().deleteByID(version.SetupID)
	if err != nil {
		return err
	}

	err = p.session.Result().deleteByID(version.ResultID)
	return err
}

func (p Project) deleteAllVersionsWithChilds(dbProject *project.Project, projectID ProjectID) error {
	for _, version := range dbProject.Versions {
		err := p.deleteVersionChilds(&version, projectID)
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
	collection := p.Collection()
	dbProject, err := p.Fetch(projectID)
	switch {
	case dbProject == nil:
		return ErrNotFound
	case err != nil:
		return err
	}

	err = p.deleteAllVersionsWithChilds(dbProject, projectID)
	if err != nil {
		return err
	}

	selector := projectID.generateSelector()
	return collection.Remove(selector)
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
	Status   project.VersionStatus
	Settings project.Settings
	Setup    *setup.Setup
	Result   *result.Result
}

func (p Project) createNewVersionFromPrototype(projectID ProjectID, prototype versionPrototype) (*project.Version, error) {
	newVersion := &project.Version{ID: prototype.ID, Settings: prototype.Settings}

	setupID, err := p.session.Setup().Create(prototype.Setup)
	if err != nil {
		return nil, err
	}
	newVersion.SetupID = setupID

	resultID, err := p.session.Result().Create(prototype.Result)
	if err != nil {
		return nil, err
	}
	newVersion.ResultID = resultID

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
		Status:   project.New,
		Settings: project.NewSettings(),
		Setup:    setup.NewEmptySetup(),
		Result:   result.NewEmptyResult(),
	}
	newVersion, err := p.createNewVersionFromPrototype(projectID, newVersionPrototype)
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

	existingSetup, err := p.session.Setup().fetchByID(existingVersion.SetupID)
	if err != nil {
		return nil, err
	}

	existingResult, err := p.session.Result().fetchByID(existingVersion.ResultID)
	if err != nil {
		return nil, err
	}

	newVersionPrototype := versionPrototype{
		ID:       newVersionID,
		Status:   project.New,
		Settings: existingVersion.Settings,
		Setup:    existingSetup,
		Result:   existingResult,
	}
	newVersion, err := p.createNewVersionFromPrototype(existingVersionID.toProjectID(), newVersionPrototype)
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

// UpdateVersion update version with the given versionID.
func (p Project) UpdateVersion(versionID VersionID, newSettings project.Settings) error {
	dbProject, err := p.Fetch(versionID.toProjectID())
	switch {
	case err != nil:
		return err
	case dbProject == nil:
		return ErrNotFound
	}

	if int(versionID.Version) >= len(dbProject.Versions) {
		return ErrNotFound
	}

	dbProject.Versions[versionID.Version].Settings = newSettings
	dbProject.Versions[versionID.Version].Status = project.Edited

	return p.Update(dbProject)
}

// FetchVersionStatus fetch VersionStatus.
func (p Project) FetchVersionStatus(versionID VersionID) (project.VersionStatus, error) {
	version, err := p.FetchVersion(versionID)
	switch {
	case err != nil:
		return 0, err
	case version == nil:
		return 0, ErrNotFound
	}
	return version.Status, nil
}

// SetVersionStatus sets new VersionStatus.
func (p Project) SetVersionStatus(versionID VersionID, newStatus project.VersionStatus) error {
	collection := p.Collection()
	selector := versionID.toProjectID().generateSelector()
	toUpdate := bson.M{"$set": bson.M{
		fmt.Sprintf("versions.%d.status", versionID.Version): newStatus,
	}}
	return collection.Update(selector, toUpdate)
}
