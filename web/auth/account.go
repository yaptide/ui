package auth

import (
	"encoding/json"
	"log"
	"net/http"

	"gopkg.in/mgo.v2/bson"

	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/server"
)

type getAccountHandler struct {
	*server.Context
}

func (h *getAccountHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	db := h.Db.Copy()
	defer db.Close()

	id := bson.ObjectIdHex(r.Context().Value(token.ContextIDKey).(string))

	acc, err := db.Account.GetByID(id)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if acc == nil {
		w.WriteHeader(http.StatusNotFound)
	}

	acc.Password = ""

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(acc)
	if err != nil {
		log.Println(err.Error())
	}
}
