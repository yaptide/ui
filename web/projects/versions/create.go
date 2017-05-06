package versions

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Palantir/palantir/db"
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/pathvars"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
)

type createVersionHandler struct {
	*server.Context
}

func createVersion(createInDb, writeVersionResponse func() bool) {
	ok := createInDb()
	if !ok {
		return
	}
	_ = writeVersionResponse()
}

func (h *createVersionHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	projectID, isValid := pathvars.ExtractProjectID(r)
	if !isValid {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	accountID := token.ExtractAccountID(r)

	dbSession := h.Db.Copy()
	defer dbSession.Close()

	var dbVersion *project.Version

	createInDb := func() bool {
		version, err := dbSession.Project().CreateVersion(
			db.ProjectID{Account: accountID, Project: projectID},
		)

		switch {
		case err != nil:
			log.Print(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return false
		case version == nil:
			w.WriteHeader(http.StatusNotFound)
			return false
		}

		dbVersion = version
		return true
	}

	writeVersionResponse := func() bool {
		headers := make(map[string]string)
		headers["Location"] = fmt.Sprintf("/projects/%s/versions/%d",
			projectID.Hex(), dbVersion.ID)
		return util.WriteJSONResponseWithHeaders(w, http.StatusCreated, headers, dbVersion)
	}

	createVersion(createInDb, writeVersionResponse)
}
