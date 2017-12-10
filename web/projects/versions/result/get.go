package result

import (
	"net/http"

	"github.com/Palantir/palantir/db"
	"github.com/Palantir/palantir/utils/log"
	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/pathvars"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
)

type getResultHandler struct {
	*server.Context
}

func (h *getResultHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
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

	result, err := dbSession.Result().Fetch(db.VersionID{
		Account: accountID,
		Project: projectID,
		Version: versionID,
	})
	switch err {
	case db.ErrNotFound:
		w.WriteHeader(http.StatusNotFound)
	case nil:
		_ = util.WriteJSONResponse(w, http.StatusOK, result)
	case err:
		log.Error("[API][Results][GET] Unable to fetch results from db")
		w.WriteHeader(http.StatusInternalServerError)
	}
}
