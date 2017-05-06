package projects

import (
	"log"

	"github.com/Palantir/palantir/db"
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/pathvars"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
	"gopkg.in/mgo.v2"

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
	projectID, isValid := pathvars.ExtractProjectID(r)
	if !isValid {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	accountID := token.ExtractAccountID(r)

	dbSession := h.Db.Copy()
	defer dbSession.Close()

	var dbProject *project.Project

	getFromDb := func() bool {
		project, err := dbSession.Project().Fetch(
			db.ProjectID{Account: accountID, Project: projectID},
		)

		switch {
		case err == mgo.ErrNotFound:
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

	deleteFromDb := func() bool {
		err := dbSession.Project().Delete(
			db.ProjectID{Account: accountID, Project: projectID},
		)

		switch {
		case err == mgo.ErrNotFound:
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
		return util.WriteJSONResponse(w, http.StatusOK, dbProject)
	}

	deleteProject(getFromDb, deleteFromDb, writeProjectResponse)
}
