package auth

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Palantir/palantir/model/auth"
	"github.com/Palantir/palantir/web/server"
)

type registerHandler struct {
	*server.Context
}

func (h *registerHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	acc := auth.Account{}
	err := json.NewDecoder(r.Body).Decode(&acc)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	db := h.Db.Copy()
	defer db.Close()

	responseMap := make(map[string]interface{})

	isRegistered, err := db.Account.IsRegistered(&acc)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if isRegistered {
		w.WriteHeader(http.StatusUnprocessableEntity)
		responseMap["error"] = "User already registrated"
	} else {
		w.WriteHeader(http.StatusCreated)
		err = db.Account.Create(acc)
		if err != nil {
			log.Println(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	err = json.NewEncoder(w).Encode(responseMap)
	if err != nil {
		log.Println(err.Error())
	}
}
