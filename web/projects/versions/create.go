package versions

import (
	"fmt"
	"net/http"

	"github.com/Palantir/palantir/model/project"
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
	dbProjectID, ok := util.ReadDBProjectID(w, r)
	if !ok {
		return
	}

	dbSession := h.Db.Copy()
	defer dbSession.Close()

	var dbVersion *project.Version

	createInDb := func() bool {
		version, err := dbSession.Project().CreateVersionFromLatest(dbProjectID)
		if err != nil {
			util.HandleDbError(w, err)
			return false
		}

		dbVersion = version
		return true
	}

	writeVersionResponse := func() bool {
		headers := make(map[string]string)
		headers["Location"] = fmt.Sprintf("/projects/%s/versions/%d",
			dbProjectID.Project, dbVersion.ID)
		return util.WriteJSONResponseWithHeaders(w, http.StatusCreated, headers, dbVersion)
	}

	createVersion(createInDb, writeVersionResponse)
}
