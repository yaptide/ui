package auth

import (
	"encoding/json"
	"log"
	"net/http"

	"gopkg.in/mgo.v2/bson"

	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/server"
)

type fetchAccountHandler struct {
	*server.Context
}

func (h *fetchAccountHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	db := h.Db.Copy()
	defer db.Close()

	id := bson.ObjectIdHex(r.Context().Value(token.ContextIDKey).(string))

	account, err := db.Account.FindByID(id)
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

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(account)
	if err != nil {
		log.Println(err.Error())
	}
}
