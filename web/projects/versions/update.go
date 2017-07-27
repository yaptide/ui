package versions

import (
	"fmt"

	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"

	"net/http"
)

type updateVersionHandler struct {
	*server.Context
}

func updateVersion(isVersionModifable, updateInDb, writeResponse func() bool) {
	ok := isVersionModifable()
	if !ok {
		return
	}
	ok = updateInDb()
	if !ok {
		return
	}
	_ = writeResponse()
}

func (h *updateVersionHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	dbVersionID, ok := util.ReadDBVersionID(w, r)
	if !ok {
		return
	}

	updateRQ := struct {
		Settings project.Settings `json:"settings"`
	}{}
	ok = util.DecodeJSONRequest(w, r, updateRQ)
	if !ok {
		return
	}

	dbSession := h.Db.Copy()
	defer dbSession.Close()

	isVersionModifable := func() bool {
		versionStatus, err := dbSession.Project().FetchVersionStatus(dbVersionID)
		if err != nil {
			util.HandleDbError(w, err)
			return false
		}
		if !versionStatus.IsModifable() {
			errorMap := map[string]string{}
			errorMap["error"] =
				fmt.Sprint("Cannot modify version with a ", versionStatus, "status")
			util.WriteJSONResponse(w, http.StatusBadRequest, errorMap)
			return false
		}
		return true
	}

	updateInDb := func() bool {
		err := dbSession.Project().UpdateVersion(dbVersionID, updateRQ.Settings)
		if err != nil {
			util.HandleDbError(w, err)
			return false
		}
		return true
	}

	writeResponse := func() bool {
		updatedVersion, err := dbSession.Project().FetchVersion(dbVersionID)
		if err != nil {
			util.HandleDbError(w, err)
			return false
		}
		return util.WriteJSONResponse(w, http.StatusOK, updatedVersion)
	}

	updateVersion(isVersionModifable, updateInDb, writeResponse)
}
