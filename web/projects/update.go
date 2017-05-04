package projects

import (
	"log"

	"github.com/Palantir/palantir/db"
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/projects/pathvars"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"

	"net/http"
)

type updateProjectHandler struct {
	*server.Context
}

func updateProject(validateProject, getFromDb, updateInDb, writeProjectResponse func() bool) {
	ok := validateProject()
	if !ok {
		return
	}
	ok = getFromDb()
	if !ok {
		return
	}
	ok = updateInDb()
	if !ok {
		return
	}
	_ = writeProjectResponse()
}

func (h *updateProjectHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	projectID, isValid := pathvars.ExtractProjectID(r)
	if !isValid {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	accountID := token.ExtractAccountID(r)

	updatedProject := &project.Project{}
	ok := util.DecodeJSONRequest(w, r, updatedProject)
	if !ok {
		return
	}

	dbSession := h.Db.Copy()
	defer dbSession.Close()
	var dbProject *project.Project

	validateProject := func() bool {
		mapFields := map[string]string{}

		if updatedProject.Name == "" {
			mapFields["name"] = "Name is required"
		}

		if len(mapFields) != 0 {
			util.WriteJSONResponse(w, http.StatusBadRequest, mapFields)
			return false
		}
		return true
	}

	getFromDb := func() bool {
		project, err := dbSession.Project().Fetch(
			db.ProjectID{Account: accountID, Project: projectID},
		)

		switch {
		case err == db.ErrNotFound:
			w.WriteHeader(http.StatusNotFound)
			return false
		case err != nil:
			log.Print(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return false
		}
		dbProject = project
		return true
	}

	updateInDb := func() bool {
		updatedProject.ID = projectID
		updatedProject.AccountID = accountID
		updatedProject.Versions = dbProject.Versions

		err := dbSession.Project().Update(updatedProject)
		switch {
		case err == db.ErrNotFound:
			w.WriteHeader(http.StatusNotFound)
			return false
		case err != nil:
			log.Print(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return false
		}
		return true
	}

	writeProjectResponse := func() bool {
		return util.WriteJSONResponse(w, http.StatusOK, updatedProject)
	}

	updateProject(validateProject, getFromDb, updateInDb, writeProjectResponse)
}
