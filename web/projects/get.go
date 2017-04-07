package projects

import (
	"log"

	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
	//"github.com/gorilla/mux"

	"net/http"
)

type getProjectsHandler struct {
	*server.Context
}

func (h *getProjectsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	db := h.Db.Copy()
	defer db.Close()

	accountID := token.ExtractAccountID(r)
	projectList, err := db.Project().FindAllByAccountID(accountID)
	if err != nil {
		log.Print(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	_ = util.WriteJSONResponse(w, http.StatusOK, projectList)
}
