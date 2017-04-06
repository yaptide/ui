package auth

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Palantir/palantir/model/auth"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/server/request"
)

type registerHandler struct {
	*server.Context
}

type registerContext struct {
	*request.Context
	requestAccount *auth.Account
}

func (h *registerHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	account := &auth.Account{}
	err := json.NewDecoder(r.Body).Decode(account)
	if err != nil {
		w.WriteHeader(http.StatusUnprocessableEntity)
		return
	}

	db := h.Db.Copy()
	defer db.Close()
	context := &registerContext{&request.Context{R: r, W: w, Db: db}, account}

	ok := h.validateRegister(context)
	if !ok {
		return
	}

	_ = h.register(context)
}

func (h *registerHandler) register(context *registerContext) bool {

	err := context.Db.Account().Create(*context.requestAccount)
	if err != nil {
		context.W.WriteHeader(http.StatusInternalServerError)
		return false
	}
	context.W.WriteHeader(http.StatusCreated)
	err = json.NewEncoder(context.W).Encode(context.requestAccount)
	if err != nil {
		log.Print(err.Error())
		return false
	}
	return true
}

func (h *registerHandler) validateRegister(context *registerContext) bool {
	mapFields := map[string]string{}
	account := context.requestAccount
	// validate email
	if account.Email == "" {
		mapFields["email"] = "Email is required"
	}
	userWithEmail, err := context.Db.Account().FindByEmail(account.Email)
	if err != nil {
		context.W.WriteHeader(http.StatusInternalServerError)
		return false
	}
	if userWithEmail != nil {
		mapFields["email"] = "This email is not available"
	}

	// validate username
	if account.Username == "" {
		mapFields["username"] = "Username is required"
	}

	userWithUsername, err := context.Db.Account().FindByUsername(account.Username)
	if err != nil {
		context.W.WriteHeader(http.StatusInternalServerError)
		return false
	}
	if userWithUsername != nil {
		mapFields["username"] = "This username is not available"
	}

	// validate password
	if len(account.Password) < 8 {
		mapFields["password"] = "Password is too short"
	}
	if account.Password == "" {
		mapFields["password"] = "Password is required"
	}
	if len(mapFields) != 0 {
		context.W.WriteHeader(http.StatusBadRequest)
		err := json.NewEncoder(context.W).Encode(mapFields)
		if err != nil {
			log.Print(err.Error())
			return false
		}
		return false
	}
	return true
}
