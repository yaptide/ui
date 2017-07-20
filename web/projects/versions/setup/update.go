package setup

import (
	"net/http"

	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
)

type updateSetupHandler struct {
	*server.Context
}

func (h *updateSetupHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	dbVersionID, ok := util.ReadDBVersionID(w, r)
	if !ok {
		return
	}

	updatedSetup := &setup.Setup{}
	ok = util.DecodeJSONRequest(w, r, updatedSetup)
	if !ok {
		return
	}

	dbSession := h.Db.Copy()
	defer dbSession.Close()

	currentVersionStatus, err := dbSession.Project().FetchVersionStatus(dbVersionID)
	if err != nil {
		util.HandleDbError(w, err)
		return
	}

	if !currentVersionStatus.IsModifable() {
		errorResponse := map[string]string{}
		errorResponse["error"] = "Cannnot modify unmodifiable version"
		_ = util.WriteJSONResponse(w, http.StatusBadRequest, errorResponse)
		return
	}

	err = dbSession.Setup().Update(dbVersionID, updatedSetup)
	if err != nil {
		util.HandleDbError(w, err)
		return
	}

	err = dbSession.Project().SetVersionStatus(dbVersionID, project.Edited)
	if err != nil {
		util.HandleDbError(w, err)
		return
	}

	_ = util.WriteJSONResponse(w, http.StatusOK, updatedSetup)

}
