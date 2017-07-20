package projects

import (
	"github.com/Palantir/palantir/model/project"
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
	dbProjectID, ok := util.ReadDBProjectID(w, r)
	if !ok {
		return
	}

	updatedProject := &project.Project{}
	ok = util.DecodeJSONRequest(w, r, updatedProject)
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
		project, err := dbSession.Project().Fetch(dbProjectID)
		if err != nil {
			util.HandleDbError(w, err)
			return false
		}

		dbProject = project
		return true
	}

	updateInDb := func() bool {
		updatedProject.ID = dbProjectID.Project
		updatedProject.AccountID = dbProjectID.Account
		updatedProject.Versions = dbProject.Versions

		err := dbSession.Project().Update(updatedProject)
		if err != nil {
			util.HandleDbError(w, err)
			return false
		}
		return true
	}

	writeProjectResponse := func() bool {
		return util.WriteJSONResponse(w, http.StatusOK, updatedProject)
	}

	updateProject(validateProject, getFromDb, updateInDb, writeProjectResponse)
}
