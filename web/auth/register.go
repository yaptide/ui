package auth

import (
	"net/http"

	"github.com/Palantir/palantir/model/auth"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
)

type registerHandler struct {
	*server.Context
}

func register(validateRegister, registerInDb func() bool) {
	ok := validateRegister()
	if !ok {
		return
	}
	_ = registerInDb()
}

func (h *registerHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	requestAccount := &auth.Account{}
	ok := util.DecodeJSONRequest(w, r, requestAccount)
	if !ok {
		return
	}

	dbSession := h.Db.Copy()
	defer dbSession.Close()

	validateRegister := func() bool {
		mapFields := map[string]string{}
		account := requestAccount
		// validate email
		if account.Email == "" {
			mapFields["email"] = "Email is required"
		}
		userWithEmail, err := dbSession.Account().FindByEmail(account.Email)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return false
		}
		if userWithEmail != nil {
			mapFields["email"] = "This email is not available"
		}

		// validate username
		if account.Username == "" {
			mapFields["username"] = "Username is required"
		}

		userWithUsername, err := dbSession.Account().FindByUsername(account.Username)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
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
			util.WriteJSONResponse(w, http.StatusBadRequest, mapFields)
			return false
		}
		return true

	}

	registerInDb := func() bool {
		err := dbSession.Account().Create(*requestAccount)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return false
		}

		return util.WriteJSONResponse(w, http.StatusCreated, requestAccount)
	}

	register(validateRegister, registerInDb)
}
