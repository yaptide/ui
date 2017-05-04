package auth

import (
	"log"
	"net/http"

	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
)

type fetchAccountHandler struct {
	*server.Context
}

func (h fetchAccountHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	dbSession := h.Db.Copy()
	defer dbSession.Close()

	id := token.ExtractAccountID(r)

	account, err := dbSession.Account().Fetch(id)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if account == nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	account.Password = ""

	_ = util.WriteJSONResponse(w, http.StatusOK, account)
}
