package versions

import (
	"fmt"
	"net/http"

	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
)

type createFromExistingVersionHandler struct {
	*server.Context
}

func createFromExistingVersion(createFromExistingVersionInDb, writeVersionResponse func() bool) {
	ok := createFromExistingVersionInDb()
	if !ok {
		return
	}
	_ = writeVersionResponse()
}

func (h *createFromExistingVersionHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	dbVersionID, ok := util.ReadDBVersionID(w, r)
	if !ok {
		return
	}

	dbSession := h.Db.Copy()
	defer dbSession.Close()

	var copiedDbVersion project.Version

	createFromExistingVersionInDb := func() bool {
		version, err := dbSession.Project().CreateVersionFrom(dbVersionID)
		if err != nil {
			util.HandleDbError(w, err)
			return false
		}
		copiedDbVersion = version
		return true
	}

	writeVersionResponse := func() bool {
		headers := make(map[string]string)
		headers["Location"] = fmt.Sprintf("/projects/%s/versions/%d",
			dbVersionID.Project.Hex(), copiedDbVersion.ID)
		return util.WriteJSONResponseWithHeaders(w, http.StatusCreated, headers, copiedDbVersion)
	}

	createFromExistingVersion(createFromExistingVersionInDb, writeVersionResponse)
}
