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
	accountID := token.ExtractAccountID(r)
	projectID, isValid := pathvars.ExtractProjectID(r)
	if !isValid {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	versionID, isValid := pathvars.ExtractVersionID(r)
	if !isValid {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	dbSession := h.Db.Copy()
	defer dbSession.Close()

	var copiedDbVersion *project.Version

	createFromExistingVersionInDb := func() bool {
		version, err := dbSession.Project().CreateVersionFrom(
			db.VersionID{
				Account: accountID,
				Project: projectID,
				Version: versionID,
			},
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

		copiedDbVersion = version
		return true
	}

	writeVersionResponse := func() bool {
		headers := make(map[string]string)
		headers["Location"] = fmt.Sprintf("/projects/%s/versions/%d",
			projectID.Hex(), copiedDbVersion.ID)
		return util.WriteJSONResponseWithHeaders(w, http.StatusCreated, headers, copiedDbVersion)
	}

	createFromExistingVersion(createFromExistingVersionInDb, writeVersionResponse)
}
