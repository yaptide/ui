package projects

import (
	"fmt"
	"log"
	"net/http"

	"gopkg.in/mgo.v2/bson"

	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
)

type createProjectHandler struct {
	*server.Context
}

func createProject(validateProject, createInDb, writeProjectResponse func() bool) {
	ok := validateProject()
	if !ok {
		return
	}
	ok = createInDb()
	if !ok {
		return
	}
	_ = writeProjectResponse()
}

func (h *createProjectHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	newProject := project.Project{}
	ok := util.DecodeJSONRequest(w, r, &newProject)
	if !ok {
		return
	}

	dbSession := h.Db.Copy()
	defer dbSession.Close()

	validateProject := func() bool {
		mapFields := map[string]string{}

		if newProject.Name == "" {
			mapFields["name"] = "Name is required"
		}

		if len(mapFields) != 0 {
			util.WriteJSONResponse(w, http.StatusBadRequest, mapFields)
			return false
		}
		return true
	}

	createInDb := func() bool {
		newProject.ID = bson.NewObjectId()
		newProject.AccountID = token.ExtractAccountID(r)
		newProject.Versions = []project.Version{}
		err := dbSession.Project().Create(newProject)
		if err != nil {
			log.Print(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return false
		}
		return true
	}

	writeProjectResponse := func() bool {
		headers := make(map[string]string)
		headers["Location"] = fmt.Sprintf("/projects/%s", newProject.ID.Hex())
		return util.WriteJSONResponseWithHeaders(w, http.StatusCreated, headers, newProject)
	}

	createProject(validateProject, createInDb, writeProjectResponse)
}
