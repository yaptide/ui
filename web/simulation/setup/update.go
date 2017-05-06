package setup

import (
	"log"
	"net/http"

	"github.com/Palantir/palantir/db"
	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/pathvars"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
)

type updateSetupHandler struct {
	*server.Context
}

func (h *updateSetupHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	accountID := token.ExtractAccountID(r)

	setupID, isValid := pathvars.ExtractSetupID(r)
	if !isValid {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	updatedSetup := &setup.Setup{}
	ok := util.DecodeJSONRequest(w, r, updatedSetup)
	if !ok {
		return
	}

	dbSession := h.Db.Copy()
	defer dbSession.Close()

	err := dbSession.Setup().Update(db.SetupID{Account: accountID, Setup: setupID},
		updatedSetup)

	switch {
	case err == db.ErrNotFound:
		w.WriteHeader(http.StatusNotFound)
		return
	case err != nil:
		log.Print(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	_ = util.WriteJSONResponse(w, http.StatusOK, updatedSetup)

}
