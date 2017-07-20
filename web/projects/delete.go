package projects

import (
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"

	"net/http"
)

type deleteProjectHandler struct {
	*server.Context
}

func deleteProject(getFromDb, deleteFromDb, writeProjectResponse func() bool) {
	ok := getFromDb()
	if !ok {
		return
	}

	ok = deleteFromDb()
	if !ok {
		return
	}
	_ = writeProjectResponse()
}

func (h *deleteProjectHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	dbProjectID, ok := util.ReadDBProjectID(w, r)
	if !ok {
		return
	}

	dbSession := h.Db.Copy()
	defer dbSession.Close()

	var dbProject *project.Project

	getFromDb := func() bool {
		project, err := dbSession.Project().Fetch(dbProjectID)
		if err != nil {
			util.HandleDbError(w, err)
			return false
		}

		dbProject = project
		return true
	}

	deleteFromDb := func() bool {
		err := dbSession.Project().Delete(dbProjectID)
		if err != nil {
			util.HandleDbError(w, err)
			return false
		}
		return true
	}

	writeProjectResponse := func() bool {
		return util.WriteJSONResponse(w, http.StatusOK, dbProject)
	}

	deleteProject(getFromDb, deleteFromDb, writeProjectResponse)
}
