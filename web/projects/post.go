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

func createProject(createInDb, writeProjectResponse func() bool) {
	ok := createInDb()
	if !ok {
		return
	}
	_ = writeProjectResponse()
}

func (h *createProjectHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	project := &project.Project{}
	ok := util.DecodeJSONResponse(w, r, project)
	if !ok {
		return
	}

	db := h.Db.Copy()
	defer db.Close()

	createInDb := func() bool {
		project.ID = bson.NewObjectId()
		project.AccountID = token.ExtractAccountID(r)
		err := db.Project().Create(project)
		if err != nil {
			log.Print(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return false
		}
		return true
	}

	writeProjectResponse := func() bool {
		headers := make(map[string]string)
		headers["Location"] = fmt.Sprintf("/projects/%s", project.ID.Hex())
		return util.WriteJSONResponseWithHeaders(w, http.StatusCreated, headers, project)
	}

	createProject(createInDb, writeProjectResponse)
}
