package id

import (
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
	"gopkg.in/mgo.v2"

	"net/http"
)

type updateProjectHandler struct {
	*server.Context
}

func updateProject(updateInDb, writeProjectResponse func() bool) {
	ok := updateInDb()
	if !ok {
		return
	}
	_ = writeProjectResponse()
}

func (h *updateProjectHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	projectID, isValid := extractProjectID(r)
	if !isValid {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	accountID := token.ExtractAccountID(r)

	project := &project.Project{}
	ok := util.DecodeJSONResponse(w, r, project)
	if !ok {
		return
	}

	db := h.Db.Copy()
	defer db.Close()

	updateInDb := func() bool {
		project.ID = projectID
		project.AccountID = accountID

		err := db.Project().Update(project)
		switch {
		case err == mgo.ErrNotFound:
			w.WriteHeader(http.StatusNotFound)
			return false
		case err != nil:
			w.WriteHeader(http.StatusInternalServerError)
			return false
		}
		return true
	}

	writeProjectResponse := func() bool {
		return util.WriteJSONResponse(w, http.StatusOK, project)
	}

	updateProject(updateInDb, writeProjectResponse)
}
