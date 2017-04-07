package auth

import (
	"net/http"

	"github.com/Palantir/palantir/model/auth"
	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
)

type loginHandler struct {
	*server.Context
}

func login(validateLogin, generateToken func() bool) {
	ok := validateLogin()
	if !ok {
		return
	}
	_ = generateToken()
}

func (h *loginHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	requestAccount := &auth.Account{}
	ok := util.DecodeJSONResponse(w, r, requestAccount)
	if !ok {
		return
	}

	db := h.Db.Copy()
	defer db.Close()
	var dbAccount *auth.Account

	validateLogin := func() bool {
		sendError := func(errorMap map[string]string) {
			util.WriteJSONResponse(w, http.StatusNotFound, errorMap)
		}

		mapFields := map[string]string{}

		// validate username
		if requestAccount.Username == "" {
			mapFields["username"] = "Username is required"
		}
		userWithUsername, userErr := db.Account().FindByUsername(requestAccount.Username)
		userWithEmail, emailErr := db.Account().FindByEmail(requestAccount.Username)
		switch {
		case userErr != nil:
			w.WriteHeader(http.StatusInternalServerError)
			return false
		case emailErr != nil:
			w.WriteHeader(http.StatusInternalServerError)
			return false
		}

		switch {
		case userWithEmail != nil:
			dbAccount = userWithEmail
		case userWithUsername != nil:
			dbAccount = userWithUsername
		default:
			mapFields["all"] = "Login or password incorrect"
			sendError(mapFields)
			return false
		}

		// validate password
		if requestAccount.Password == "" {
			mapFields["password"] = "Password is required"
		}
		ok := dbAccount.ComparePassword(requestAccount.Password)
		if !ok {
			mapFields["all"] = "Login or password incorrect"
		}

		if len(mapFields) != 0 {
			sendError(mapFields)
			return false
		}

		return true
	}

	generateToken := func() bool {
		tokenString, err := token.Generate(dbAccount.ID, h.JWTKey)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return false
		}

		dbAccount.Password = ""

		response := &struct {
			*auth.Account
			Token string `json:"token"`
		}{
			dbAccount,
			tokenString,
		}

		return util.WriteJSONResponse(w, http.StatusOK, response)
	}

	login(validateLogin, generateToken)
}
