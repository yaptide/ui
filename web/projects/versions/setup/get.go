package setup

import (
	"net/http"

	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
)

type getSetupHandler struct {
	*server.Context
}

func (h *getSetupHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	dbVersionID, ok := util.ReadDBVersionID(w, r)
	if !ok {
		return
	}

	dbSession := h.Db.Copy()
	defer dbSession.Close()

	setup, err := dbSession.Setup().Fetch(dbVersionID)
	if err != nil {
		util.HandleDbError(w, err)
		return
	}
	_ = util.WriteJSONResponse(w, http.StatusOK, &setup)

}
