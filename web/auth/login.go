package auth

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Palantir/palantir/model/auth"
	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/server/request"
)

type loginHandler struct {
	*server.Context
}

type loginContext struct {
	*request.Context
	requestAccount *auth.Account
	dbAccount      *auth.Account
}

func (h *loginHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	account := &auth.Account{}
	err := json.NewDecoder(r.Body).Decode(account)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	db := h.Db.Copy()
	defer db.Close()

	context := &loginContext{&request.Context{R: r, W: w, Db: db}, account, nil}

	ok := h.validateLogin(context)
	if !ok {
		return
	}

	_ = h.login(context)
}

func (h *loginHandler) login(context *loginContext) bool {
	tokenString, err := token.Generate(context.dbAccount.ID, h.JWTKey)
	if err != nil {
		context.W.WriteHeader(http.StatusInternalServerError)
		return false
	}

	context.dbAccount.Password = ""

	response := &struct {
		*auth.Account
		Token string `json:"token"`
	}{
		context.dbAccount,
		tokenString,
	}
	err = json.NewEncoder(context.W).Encode(response)
	if err != nil {
		log.Print(err.Error())
		return false
	}

	return true

}

func (h *loginHandler) validateLogin(context *loginContext) bool {
	sendError := func(errorMap map[string]string) {
		context.W.WriteHeader(http.StatusNotFound)
		err := json.NewEncoder(context.W).Encode(errorMap)
		if err != nil {
			log.Print(err.Error())
		}
	}

	mapFields := map[string]string{}

	// validate username
	if context.requestAccount.Username == "" {
		mapFields["username"] = "Username is required"
	}
	userWithUsername, userErr := context.Db.Account().FindByUsername(context.requestAccount.Username)
	userWithEmail, emailErr := context.Db.Account().FindByEmail(context.requestAccount.Username)
	switch {
	case userErr != nil:
		context.W.WriteHeader(http.StatusInternalServerError)
		return false
	case emailErr != nil:
		context.W.WriteHeader(http.StatusInternalServerError)
		return false
	}

	switch {
	case userWithEmail != nil:
		context.dbAccount = userWithEmail
	case userWithUsername != nil:
		context.dbAccount = userWithUsername
	default:
		mapFields["all"] = "Login or password incorrect"
		sendError(mapFields)
		return false
	}

	// validate password
	if context.requestAccount.Password == "" {
		mapFields["password"] = "Password is required"
	}
	ok := context.dbAccount.ComparePassword(context.requestAccount.Password)
	if !ok {
		mapFields["all"] = "Login or password incorrect"
	}

	if len(mapFields) != 0 {
		sendError(mapFields)
		return false
	}

	return true
}
